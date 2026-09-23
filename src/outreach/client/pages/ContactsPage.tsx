/** @jsxImportSource react */
import React, { useState, useEffect, useRef } from "react";
import readXlsxFile from "read-excel-file/browser";
import { contactsApi } from "../lib/api";
import { useToast } from "../App";
import { ContactImportReports } from "./ContactImportReports";

const IMPORT_HEADERS = ["邮箱", "名称", "公司", "网站", "行业", "地区", "标签"];
const CREATE_IMPORT_GROUP_VALUE = "__create_import_group__";

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const rowsToContacts = (sourceRows: unknown[][]) => {
  const rows = sourceRows.map((row) => row.map((cell) => String(cell ?? "").trim())).filter((row) => row.some(Boolean));
  if (!rows.length) return [];
  const first = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = ["邮箱", "email", "email address"].includes(first[0]);
  return rows.slice(hasHeader ? 1 : 0).map((parts) => ({
    email: parts[0],
    name: parts[1] || undefined,
    company: parts[2] || undefined,
    website: parts[3] || undefined,
    industry: parts[4] || undefined,
    region: parts[5] || undefined,
    tags: parts[6] ? parts[6].split("|").map((tag) => tag.trim()).filter(Boolean) : undefined,
  }));
};

const emptyContactForm = () => ({
  email: "",
  name: "",
  company: "",
  website: "",
  industry: "",
  region: "",
  groupId: "",
  tags: [] as string[],
});

const parseContactTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
};

export function ContactsPage() {
  const { addToast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [knownTags, setKnownTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"selected" | "all" | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<any>(null);
  const [deleteGroupContacts, setDeleteGroupContacts] = useState(false);
  const [showImportReports, setShowImportReports] = useState(false);
  const [activeImportId, setActiveImportId] = useState("");
  const mounted = useRef(true);
  const contactsRequest = useRef(0);
  const [batchGroupSelect, setBatchGroupSelect] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [importText, setImportText] = useState("");
  const [importGroupId, setImportGroupId] = useState("");
  const [overwriteImport, setOverwriteImport] = useState(false);
  const [importContacts, setImportContacts] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [readingImportFile, setReadingImportFile] = useState(false);
  const [importNewGroupName, setImportNewGroupName] = useState("");
  const [creatingImportGroup, setCreatingImportGroup] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    active: boolean;
    current: number;
    total: number;
    importedCount: number;
    skippedCount: number;
    failedCount: number;
    stage: string;
  } | null>(null);

  const [form, setForm] = useState(emptyContactForm);
  const importCompleted = !!activeImportId && !!importProgress && importProgress.current === importProgress.total && !importProgress.active;
  const importInputsLocked = importing || readingImportFile || (!!activeImportId && !importCompleted);
  const selectedCount = allSelected ? Math.max(0, (meta?.total || 0) - excludedIds.length) : selected.length;
  const selection = allSelected ? { all: true, excludedIds, filters: { search, groupId: selectedGroup, tag: selectedTag } } : { ids: selected };
  const isSelected = (id: string) => allSelected ? !excludedIds.includes(id) : selected.includes(id);
  const clearSelection = () => { setSelected([]); setAllSelected(false); setExcludedIds([]); };

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { clearSelection(); }, [search, selectedGroup, selectedTag]);
  useEffect(() => {
    if (!importing) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [importing]);

  useEffect(() => {
    loadGroups();
    loadTags();
  }, []);

  useEffect(() => {
    loadContacts();
  }, [search, selectedGroup, selectedTag, page]);

  const loadGroups = async () => {
    try {
      const res = await contactsApi.listGroups();
      setGroups(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTags = async () => {
    try {
      const res = await contactsApi.listTags();
      setKnownTags(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContacts = async () => {
    const requestId = ++contactsRequest.current;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: "20",
      };
      if (search) params.search = search;
      if (selectedGroup) params.groupId = selectedGroup;
      if (selectedTag) params.tag = selectedTag;

      const res = await contactsApi.list(params);
      if (requestId !== contactsRequest.current || !mounted.current) return;
      if (page > 1 && page > Math.max(1, res.meta?.totalPages || 0)) {
        setPage(Math.max(1, res.meta?.totalPages || 0));
        return;
      }
      setContacts(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      if (requestId === contactsRequest.current && mounted.current) setLoading(false);
    }
  };

  const resetImport = () => {
    setActiveImportId("");
    setOverwriteImport(false);
    setImportText("");
    setImportGroupId("");
    setImportContacts([]);
    setImportFileName("");
    setImportNewGroupName("");
    setCreatingImportGroup(false);
    setImportProgress(null);
  };

  const continueImport = () => {
    setActiveImportId("");
    setImportText("");
    setImportContacts([]);
    setImportFileName("");
    setImportProgress(null);
  };

  const downloadImportTemplate = () => {
    const sample = [
      IMPORT_HEADERS,
      ["john@example.com", "John Doe", "Acme Inc", "https://acme.com", "Technology", "US", "客户|高意向"],
    ];
    const csv = `\uFEFF${sample.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "growthos-contacts-import-template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    setReadingImportFile(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const rows = extension === "xlsx"
        ? await readXlsxFile(file) as unknown as unknown[][]
        : parseCsvRows(await file.text());
      const parsed = rowsToContacts(rows);
      if (!parsed.length) throw new Error("文件中没有识别到联系人，请使用标准导入模板");
      setActiveImportId("");
      setImportProgress(null);
      setImportContacts(parsed);
      setImportFileName(file.name);
      setImportText("");
    } catch (error: any) {
      addToast("error", error.message || "文件解析失败");
    } finally { setReadingImportFile(false); }
  };

  const handleContactsImport = async () => {
    if (importing || readingImportFile) return;
    if (importGroupId === CREATE_IMPORT_GROUP_VALUE) {
      addToast("error", "请先创建分组，或选择已有分组");
      return;
    }
    const parsed = importContacts.length ? importContacts : rowsToContacts(parseCsvRows(importText));
    if (!parsed.length) {
      addToast("error", "请选择 CSV/Excel 文件或粘贴联系人数据");
      return;
    }

    const total = parsed.length;
    setImporting(true);
    setImportProgress({
      active: true,
      current: 0,
      total,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      stage: `准备导入 ${total} 位联系人...`,
    });

    const CHUNK_SIZE = 500;
    let totalImported = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    try {
      const jobId = activeImportId || (await contactsApi.createImport({
        name: importFileName || "粘贴导入", total, groupId: importGroupId || undefined, overwrite: overwriteImport,
      })).data.id;
      setActiveImportId(jobId);
      for (let index = 0; index < parsed.length; index += CHUNK_SIZE) {
        if (!mounted.current) return;
        const chunk = parsed.slice(index, index + CHUNK_SIZE);
        const currentBatchNum = Math.floor(index / CHUNK_SIZE) + 1;
        const totalBatches = Math.ceil(parsed.length / CHUNK_SIZE);

        setImportProgress({
          active: true,
          current: index,
          total,
          importedCount: totalImported,
          skippedCount: totalSkipped,
          failedCount: totalFailed,
          stage: `正在导入第 ${currentBatchNum}/${totalBatches} 批数据 (${chunk.length} 人)...`,
        });

        try {
          const res = await contactsApi.importBatch(jobId, Math.floor(index / CHUNK_SIZE), chunk);
          totalImported += (res.data?.imported || 0) + (res.data?.updated || 0);
          totalSkipped += (res.data?.skipped || 0);
          totalFailed += (res.data?.failed || 0);
        } catch (error: any) {
          console.error("Batch import error:", error);
          throw new Error(`第 ${currentBatchNum} 批导入失败，已停止。此前成功 ${totalImported} 人。请重试：${error.message}`);
        }

        const processed = Math.min(total, index + chunk.length);
        setImportProgress({
          active: true,
          current: processed,
          total,
          importedCount: totalImported,
          skippedCount: totalSkipped,
          failedCount: totalFailed,
          stage: `已完成 ${processed}/${total} 位联系人`,
        });
      }

      setImportProgress({
        active: false,
        current: total,
        total,
        importedCount: totalImported,
        skippedCount: totalSkipped,
        failedCount: totalFailed,
        stage: `导入完成：成功 ${totalImported}，跳过 ${totalSkipped}，失败 ${totalFailed}`,
      });

      addToast(totalSkipped || totalFailed ? "warning" : "success", `导入完成: 成功 ${totalImported}，跳过 ${totalSkipped}，失败 ${totalFailed}，可查看报告`);

    } catch (error: any) {
      setImportProgress((current) => current ? { ...current, active: false, stage: error.message || "导入失败，请重试" } : current);
      addToast("error", error.message || "导入过程中发生异常");
    } finally {
      if (mounted.current) {
        setImporting(false);
        loadContacts();
        loadGroups();
        loadTags();
      }
    }
  };

  const handleCreateImportGroup = async () => {
    const name = importNewGroupName.trim();
    if (!name) {
      addToast("error", "请输入分组名称");
      return;
    }

    const existingGroup = groups.find((group) => group.name?.trim().toLowerCase() === name.toLowerCase());
    if (existingGroup) {
      setImportGroupId(existingGroup.id);
      setImportNewGroupName("");
      addToast("success", `已选择现有分组“${existingGroup.name}”`);
      return;
    }

    setCreatingImportGroup(true);
    try {
      const response = await contactsApi.createGroup({ name });
      const createdGroup = response.data;
      setGroups((current) => [...current, createdGroup]);
      setImportGroupId(createdGroup.id);
      setImportNewGroupName("");
      addToast("success", `已创建并选择分组“${createdGroup.name}”`);
    } catch (error: any) {
      addToast("error", error.message || "分组创建失败");
    } finally {
      setCreatingImportGroup(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactsApi.update(editingContact.id, form);
        addToast("success", "联系人更新成功");
      } else {
        await contactsApi.create(form);
        addToast("success", "联系人添加成功");
      }
      setShowModal(false);
      setEditingContact(null);
      setForm(emptyContactForm());
      setTagInput("");
      loadContacts();
      loadGroups();
      loadTags();
    } catch (err: any) {
      addToast("error", err.message);
    }
  };

  const openEditModal = (contact: any) => {
    setEditingContact(contact);
    setForm({
      email: contact.email || "",
      name: contact.name || "",
      company: contact.company || "",
      website: contact.website || "",
      industry: contact.industry || "",
      region: contact.region || "",
      groupId: contact.groupId || "",
      tags: parseContactTags(contact.tags),
    });
    setTagInput("");
    setShowModal(true);
  };

  const addFormTag = (rawTag: string) => {
    const tag = rawTag.trim().replace(/^#/, "");
    if (!tag || form.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setForm((current) => ({ ...current, tags: [...current.tags, tag] }));
    setTagInput("");
  };

  const removeFormTag = (tag: string) => {
    setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此联系人及关联的发送明细、CRM 记录？此操作不可撤销。")) return;
    try {
      await contactsApi.delete(id);
      addToast("success", "已删除");
      clearSelection();
      loadContacts();
      loadGroups();
      loadTags();
    } catch (err: any) {
      addToast("error", err.message);
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await contactsApi.updateGroup(editingGroup.id, groupForm);
        addToast("success", "分组更新成功");
      } else {
        await contactsApi.createGroup(groupForm);
        addToast("success", "分组创建成功");
      }
      setGroupForm({ name: "", description: "" });
      setEditingGroup(null);
      loadGroups();
    } catch (err: any) {
      addToast("error", err.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup || bulkBusy) return;
    const id = deletingGroup.id;
    setBulkBusy(true);
    try {
      const result = await contactsApi.deleteGroup(id, deleteGroupContacts);
      addToast(result.data.deleted ? "success" : "warning", result.data.deleted ? "分组已删除" : `已删除 ${result.data.deletedContacts} 位联系人；未结束活动的联系人和分组已保留`);
      setDeletingGroup(null);
      clearSelection();
      if (selectedGroup === id) {
        setSelectedGroup("");
      }
      loadGroups();
      loadContacts();
      loadTags();
    } catch (err: any) {
      addToast("error", err.message);
    } finally { setBulkBusy(false); }
  };

  const handleBatchDelete = async () => {
    if (!deleteScope || bulkBusy) return;
    setBulkBusy(true);
    try {
      const res = await contactsApi.batchDelete(deleteScope === "all" ? { all: true, filters: {} } : selection);
      addToast(res.data.protected ? "warning" : "success", `已删除 ${res.data.deleted} 个联系人${res.data.protected ? `，${res.data.protected} 位联系人关联未结束活动，已保护` : ""}`);
      clearSelection();
      setDeleteScope(null);
      setPage(1);
      loadContacts();
      loadGroups();
      loadTags();
    } catch (err: any) {
      addToast("error", err.message);
    } finally { setBulkBusy(false); }
  };

  const handleBatchMoveGroup = async () => {
    if (!selectedCount || !batchGroupSelect || bulkBusy) return;
    setBulkBusy(true);
    try {
      const res = await contactsApi.batchMove(selection, batchGroupSelect === "null" ? null : batchGroupSelect);
      addToast("success", `已移动 ${res.data.moved} 个联系人`);
      clearSelection();
      setBatchGroupSelect("");
      loadContacts();
      loadGroups();
    } catch (err: any) {
      addToast("error", err.message);
    } finally { setBulkBusy(false); }
  };

  const toggleSelect = (id: string) => {
    if (allSelected) {
      setExcludedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allPageSelected = contacts.every((contact) => isSelected(contact.id));
    const ids = contacts.map((contact) => contact.id);
    if (allSelected) setExcludedIds((prev) => allPageSelected ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id)));
    else setSelected((prev) => allPageSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>联系人管理</h2>
            <p>管理你的邮件联系人列表</p>
          </div>
          <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={() => setShowImportReports(true)}>导入进度与报告</button>
            <button className="btn btn-secondary" onClick={() => setShowGroupModal(true)}>
              📁 分组管理
            </button>
            <button className="btn btn-secondary" onClick={() => { if (!importing && (!activeImportId || importProgress?.current === importProgress?.total)) resetImport(); setShowImportModal(true); }}>
              📥 批量导入
            </button>
            <button className="btn btn-primary" onClick={() => {
              setEditingContact(null);
              setForm(emptyContactForm());
              setTagInput("");
              setShowModal(true);
            }}>
              ➕ 添加联系人
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="flex gap-md items-center" style={{ marginBottom: 20, flexWrap: "wrap" }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="搜索邮箱..."
              value={search}
              onChange={(e) => { setSearch((e.target as HTMLInputElement).value); setPage(1); }}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedGroup}
            onChange={(e) => { setSelectedGroup((e.target as HTMLSelectElement).value); setPage(1); }}
          >
            <option value="">全部分组</option>
            <option value="null">默认分组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.contactCount})
              </option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedTag}
            onChange={(e) => { setSelectedTag((e.target as HTMLSelectElement).value); setPage(1); }}
          >
            <option value="">全部标签</option>
            {knownTags.map((tag) => (
              <option key={tag.name} value={tag.name}>#{tag.name} ({tag.contactCount})</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" disabled={loading || bulkBusy || !meta?.total} onClick={() => { setAllSelected(true); setExcludedIds([]); setSelected([]); }}>选择全部结果 ({meta?.total || 0})</button>
          {selectedCount > 0 && <button className="btn btn-secondary btn-sm" disabled={bulkBusy} onClick={clearSelection}>取消选择</button>}
          <button className="btn btn-danger-outline btn-sm" disabled={bulkBusy || importing} onClick={() => setDeleteScope("all")}>清空联系人库</button>
          {selectedCount > 0 && (
            <div className="flex gap-sm items-center" style={{ flexWrap: "wrap" }}>
              <select
                className="form-select"
                style={{ width: 150 }}
                value={batchGroupSelect}
                onChange={(e) => setBatchGroupSelect((e.target as HTMLSelectElement).value)}
              >
                <option value="">移动到...</option>
                <option value="null">默认分组</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {batchGroupSelect !== "" ? (
                <button className="btn btn-secondary btn-sm" disabled={bulkBusy} onClick={handleBatchMoveGroup}>
                  确认移动
                </button>
              ) : null}
              <button className="btn btn-danger btn-sm" disabled={bulkBusy} onClick={() => setDeleteScope("selected")}>
                删除选中 ({selectedCount})
              </button>
            </div>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-text-muted)" }}>
            共 {meta?.total || 0} 个联系人
          </span>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="选择本页联系人"
                    disabled={loading || bulkBusy}
                    checked={contacts.length > 0 && contacts.every((contact) => isSelected(contact.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>邮箱</th>
                <th>名称</th>
                <th>公司</th>
                <th>行业</th>
                <th>分组</th>
                <th>标签</th>
                <th>来源</th>
                <th>订阅状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={10}>
                      <div className="skeleton" style={{ height: 20, width: "100%" }}></div>
                    </td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <h3>暂无联系人</h3>
                      <p>添加或导入联系人开始你的邮件营销</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`选择 ${contact.email}`}
                        disabled={bulkBusy}
                        checked={isSelected(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                      />
                    </td>
                    <td style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                      {contact.email}
                    </td>
                    <td>{contact.name || "—"}</td>
                    <td>{contact.company || "—"}</td>
                    <td>{contact.industry || "—"}</td>
                    <td>
                      {contact.groupId ? (
                        <span className="badge badge-default" style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>
                          {groups.find(g => g.id === contact.groupId)?.name || "未知分组"}
                        </span>
                      ) : (
                        <span className="badge badge-default">默认分组</span>
                      )}
                    </td>
                    <td>
                      <div className="contact-tag-list">
                        {parseContactTags(contact.tags).length ? <>
                          {parseContactTags(contact.tags).slice(0, 2).map((tag) => <span key={tag} className="contact-tag">#{tag}</span>)}
                          {parseContactTags(contact.tags).length > 2 && <span className="contact-tag-more">+{parseContactTags(contact.tags).length - 2}</span>}
                        </> : <span className="contact-tag-empty">—</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-default">{contact.source}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          contact.subscriptionStatus === "subscribed"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {contact.subscriptionStatus === "subscribed" ? "已订阅" : "已退订"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-xs">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditModal(contact)}
                          title="编辑"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(contact.id)}
                          title="删除"
                          style={{ color: "var(--color-danger)" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "0 12px" }}>
              {page} / {meta.totalPages}
            </span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingContact ? "编辑联系人" : "添加联系人"}</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">邮箱 *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: (e.target as HTMLInputElement).value }))}
                    required
                    placeholder="contact@example.com"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">名称</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: (e.target as HTMLInputElement).value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">公司</label>
                    <input
                      className="form-input"
                      value={form.company}
                      onChange={(e) => setForm((p) => ({ ...p, company: (e.target as HTMLInputElement).value }))}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">网站</label>
                    <input
                      className="form-input"
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: (e.target as HTMLInputElement).value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">行业</label>
                    <input
                      className="form-input"
                      value={form.industry}
                      onChange={(e) => setForm((p) => ({ ...p, industry: (e.target as HTMLInputElement).value }))}
                      placeholder="科技"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">分组</label>
                  <select
                    className="form-select"
                    value={form.groupId}
                    onChange={(e) => setForm((p) => ({ ...p, groupId: (e.target as HTMLSelectElement).value }))}
                  >
                    <option value="">默认分组</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">标签</label>
                  <div className="contact-tag-editor">
                    {form.tags.map((tag) => <button type="button" key={tag} className="contact-tag-editor-chip" onClick={() => removeFormTag(tag)} title="点击移除">#{tag}<span>×</span></button>)}
                    <div className="contact-tag-input-row">
                      <input
                        className="form-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addFormTag(tagInput);
                          }
                        }}
                        placeholder="输入标签后按 Enter"
                      />
                      <button type="button" className="btn btn-secondary" disabled={!tagInput.trim()} onClick={() => addFormTag(tagInput)}>添加</button>
                    </div>
                    {knownTags.some((tag) => !form.tags.includes(tag.name)) && <div className="contact-tag-suggestions"><span>已有标签：</span>{knownTags.filter((tag) => !form.tags.includes(tag.name)).slice(0, 8).map((tag) => <button type="button" key={tag.name} onClick={() => addFormTag(tag.name)}>#{tag.name}</button>)}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContact ? "保存修改" : "添加"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">批量导入联系人</h3>
              <button className="btn btn-ghost" aria-label="关闭导入窗口" onClick={() => setShowImportModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="contact-import-heading">
                <div><h4>上传联系人文件</h4><p>支持 CSV 和 Excel (.xlsx)，邮箱为必填列。</p></div>
                <button type="button" className="btn btn-secondary btn-sm" disabled={importing} onClick={downloadImportTemplate}>⬇ 下载 CSV 导入模板</button>
              </div>
              <label className={`contact-import-dropzone ${importFileName ? "has-file" : ""}`}>
                <input type="file" disabled={importInputsLocked} accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; handleImportFile(file); }} />
                <span className="contact-import-icon">{importFileName ? "✅" : "📄"}</span>
                <strong>{importFileName || "选择 CSV 或 Excel 文件"}</strong>
                <small>{importFileName ? `已识别 ${importContacts.length} 位联系人` : "点击选择文件，单个文件建议不超过 1,000 位联系人"}</small>
              </label>
              <div className="contact-import-divider"><span>或者粘贴 CSV 数据</span></div>
              <textarea
                className="form-textarea"
                rows={5}
                disabled={importInputsLocked}
                value={importText}
                onChange={(event) => { setActiveImportId(""); setImportProgress(null); setImportText(event.target.value); setImportContacts([]); setImportFileName(""); }}
                placeholder={"john@example.com,John Doe,Acme Inc,https://acme.com,Technology,US,客户|高意向\njane@example.com,Jane Smith,Beta Corp,https://beta.com,Finance,UK,合作伙伴"}
              ></textarea>
              <div className="contact-import-format">列顺序：邮箱、名称、公司、网站、行业、地区、标签（多个标签用 | 分隔）</div>
              <div className="form-group contact-import-group">
                <label className="form-label">导入到分组</label>
                <select
                  className="form-select"
                  disabled={importInputsLocked}
                  value={importGroupId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setImportGroupId(value);
                    if (value !== CREATE_IMPORT_GROUP_VALUE) setImportNewGroupName("");
                  }}
                >
                  <option value="">默认分组</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                  <option value={CREATE_IMPORT_GROUP_VALUE}>＋ 新建分组...</option>
                </select>
                {importGroupId === CREATE_IMPORT_GROUP_VALUE && (
                  <div className="contact-import-create-group">
                    <input
                      className="form-input"
                      disabled={importing}
                      value={importNewGroupName}
                      onChange={(event) => setImportNewGroupName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleCreateImportGroup();
                        }
                      }}
                      placeholder="输入新分组名称"
                      aria-label="新分组名称"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={importing || creatingImportGroup || !importNewGroupName.trim()}
                      onClick={handleCreateImportGroup}
                    >
                      {creatingImportGroup ? "创建中..." : "创建并选择"}
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={overwriteImport} disabled={importInputsLocked}
                    onChange={(event) => setOverwriteImport(event.target.checked)} />
                  邮箱已存在时覆盖联系人资料
                </label>
                <p className="form-help">覆盖名称、公司、网站、行业、地区和标签，空值也会覆盖；选择分组时同时更新分组。保留退订状态和历史记录。</p>
                <p className="form-help">不覆盖时，已有邮箱跳过且不加入新分组。每位联系人只属于一个分组，覆盖并改组会减少原分组人数。</p>
              </div>
              {importProgress && (
                <div className="contact-import-progress-box">
                  <div className="contact-import-progress-header">
                    <span>{importProgress.stage}</span>
                    <span className="contact-import-progress-percentage">
                      {Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="contact-import-progress-track">
                    <div
                      className={`contact-import-progress-bar ${importProgress.active ? "active" : ""}`}
                      style={{ width: `${Math.round((importProgress.current / (importProgress.total || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="contact-import-progress-stats">
                    <span className="contact-import-progress-badge">📊 总计: {importProgress.total}</span>
                    <span className="contact-import-progress-badge" style={{ color: "var(--color-success)" }}>✅ 新增/覆盖: {importProgress.importedCount}</span>
                    <span className="contact-import-progress-badge" style={{ color: "var(--color-warning)" }}>⏭️ 跳过/重复: {importProgress.skippedCount}</span>
                    <span className="contact-import-progress-badge" style={{ color: "var(--color-danger)" }}>失败: {importProgress.failedCount}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                关闭窗口
              </button>
              {activeImportId && <button className="btn btn-secondary" onClick={() => setShowImportReports(true)}>查看进度与报告</button>}
              {activeImportId && !importing && !importCompleted && <button className="btn btn-secondary" disabled={readingImportFile} onClick={continueImport}>新建导入</button>}
              <button className="btn btn-primary" disabled={importing || readingImportFile} onClick={importCompleted ? continueImport : handleContactsImport}>
                {readingImportFile ? "读取文件中..." : importing ? "正在导入..." : importCompleted ? "继续导入" : activeImportId ? "重试未完成批次" : "开始导入"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Management Modal */}
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => { setShowGroupModal(false); setEditingGroup(null); setGroupForm({name:"", description:""}); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h3 className="modal-title">分组管理</h3>
              <button className="btn btn-ghost" onClick={() => { setShowGroupModal(false); setEditingGroup(null); setGroupForm({name:"", description:""}); }}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveGroup} style={{ marginBottom: 24, padding: 16, background: "var(--color-bg-input)", borderRadius: 8 }}>
                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>{editingGroup ? "编辑分组" : "新建分组"}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      className="form-input"
                      placeholder="分组名称 *"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      className="form-input"
                      placeholder="分组描述 (可选)"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingGroup ? "保存修改" : "添加分组"}
                  </button>
                  {editingGroup && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditingGroup(null); setGroupForm({ name: "", description: "" }); }}>
                      取消编辑
                    </button>
                  )}
                </div>
              </form>

              <div className="table-container">
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>分组名称</th>
                      <th>描述</th>
                      <th style={{ width: 80, textAlign: "center" }}>联系人数</th>
                      <th style={{ width: 100, textAlign: "center" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="empty-state" style={{ padding: "32px 0" }}>
                            <p>暂无分组</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      groups.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 500 }}>{g.name}</td>
                          <td style={{ color: "var(--color-text-secondary)" }}>{g.description || "—"}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className="badge badge-default">{g.contactCount}</span>
                          </td>
                          <td>
                            <div className="flex gap-xs" style={{ justifyContent: "center" }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description || "" }); }}
                                title="编辑"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setDeletingGroup(g); setDeleteGroupContacts(false); }}
                                title="删除"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteScope && <div className="modal-overlay"><div className="modal" role="dialog" aria-modal="true" aria-label="确认删除联系人">
        <div className="modal-header"><h3>{deleteScope === "all" ? "清空联系人库" : `删除 ${selectedCount} 位联系人`}</h3></div>
        <div className="modal-body">
          <p>{deleteScope === "all" ? "将删除当前账号全部分组的联系人，不受当前筛选和分页限制。" : `将删除选中的 ${selectedCount} 位联系人。`}</p>
          <p>此操作不可撤销，关联的发送明细和 CRM 记录也会删除。关联未结束营销活动的联系人将保留。</p>
        </div><div className="modal-footer">
          <button className="btn btn-secondary" disabled={bulkBusy} onClick={() => setDeleteScope(null)}>取消</button>
          <button className="btn btn-danger" disabled={bulkBusy} onClick={handleBatchDelete}>{bulkBusy ? "处理中..." : "确认删除"}</button>
        </div>
      </div></div>}
      {deletingGroup && <div className="modal-overlay"><div className="modal" role="dialog" aria-modal="true" aria-label="删除分组">
        <div className="modal-header"><h3>删除分组：{deletingGroup.name}</h3></div>
        <div className="modal-body">
          <label className="flex gap-sm items-center"><input type="checkbox" checked={deleteGroupContacts} disabled={bulkBusy} onChange={(event) => setDeleteGroupContacts(event.target.checked)} />同时删除该分组内的联系人</label>
          <p>{deleteGroupContacts ? "联系人、关联的发送明细和 CRM 记录将永久删除。关联未结束营销活动的联系人及分组将保留。" : "只删除分组，联系人保留并移入默认分组。"}</p>
        </div><div className="modal-footer">
          <button className="btn btn-secondary" disabled={bulkBusy} onClick={() => setDeletingGroup(null)}>取消</button>
          <button className="btn btn-danger" disabled={bulkBusy} onClick={handleDeleteGroup}>{bulkBusy ? "处理中..." : "确认删除"}</button>
        </div>
      </div></div>}
      {showImportReports && <ContactImportReports onClose={() => setShowImportReports(false)} />}
    </>
  );
}
