import { useEffect, useState } from 'react';
import type { Draft, SiteBrief } from '../shared/model';
import { briefConfirmed, pageLabel } from '../shared/site-brief';
import { Button, Field, Icon, Notice, SectionTitle } from './components';

export function ConsultationStep({
  draft,
  disabled,
  basicsReady,
  active,
  onStart,
  onAnswer,
  onRestart,
  onNext,
}: {
  draft: Draft;
  disabled: boolean;
  basicsReady: boolean;
  active: boolean;
  onStart: () => void;
  onAnswer: (questionId: string, answer: string) => void;
  onRestart: () => void;
  onNext: () => void;
}) {
  const consultation = draft.consultation;
  const question = consultation?.question;
  const [choice, setChoice] = useState('');
  const [custom, setCustom] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');

  useEffect(() => {
    setChoice('');
    setCustom(false);
    setCustomAnswer('');
  }, [question?.id]);

  const answer = custom ? customAnswer.trim() : choice;
  return (
    <>
      <SectionTitle
        eyebrow="第 2 步 / 共 5 步"
        title="需求沟通"
        description="AI 会同时查看产品图片与已知资料，每次只问一个会影响网站设计的问题。"
      />
      {!basicsReady && <Notice tone="warning">请先完善公司、市场、产品名称与产品图片。</Notice>}
      {consultation?.answers.length ? (
        <section className="panel consultation-history">
          <div className="panel-title">
            <span className="section-index">A</span>
            <h3>已确认的回答</h3>
            <span>已回答 {consultation.answers.length} 个问题</span>
          </div>
          <ol>
            {consultation.answers.map((item) => (
              <li key={item.questionId}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <section className="panel consultation-question">
        <div className="panel-title">
          <span className="section-index">{consultation?.answers.length ? 'B' : 'A'}</span>
          <h3>{question ? '当前问题' : consultation?.brief ? '沟通已整理' : '开始沟通'}</h3>
        </div>
        {question ? (
          <>
            <h4>{question.prompt}</h4>
            <p className="muted">{question.reason}</p>
            <div className="consultation-options" role="radiogroup" aria-label={question.prompt}>
              {question.options.slice(0, 4).map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`consultation-${question.id}`}
                    checked={!custom && choice === option}
                    disabled={disabled || active}
                    onChange={() => {
                      setChoice(option);
                      setCustom(false);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name={`consultation-${question.id}`}
                  checked={custom}
                  disabled={disabled || active}
                  onChange={() => {
                    setChoice('');
                    setCustom(true);
                  }}
                />
                <span>都不是，我要自定义</span>
              </label>
            </div>
            {custom && (
              <Field label="你的回答" required>
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={4000}
                  value={customAnswer}
                  disabled={disabled || active}
                  onChange={(event) => setCustomAnswer(event.target.value)}
                  placeholder="写下你希望的方向"
                />
              </Field>
            )}
            <Button
              kind="primary"
              disabled={disabled || active || !answer}
              busy={active}
              onClick={() => onAnswer(question.id, answer)}
            >
              提交回答并继续
              <Icon name="arrow" />
            </Button>
          </>
        ) : consultation?.brief ? (
          <>
            <Notice tone="success">网站方案已整理完成，请继续检查并确认。</Notice>
            <Button kind="primary" onClick={onNext} disabled={disabled || active}>
              检查网站方案
              <Icon name="arrow" />
            </Button>
          </>
        ) : (
          <>
            <p>将使用原始产品图片、Logo、公司与市场资料决定需要进一步确认的内容。</p>
            <Button
              kind="primary"
              disabled={disabled || !basicsReady || active}
              busy={active}
              onClick={onStart}
            >
              <Icon name="spark" />
              开始需求沟通
            </Button>
          </>
        )}
        {consultation && (consultation.answers.length > 0 || question || consultation.brief) && (
          <Button kind="quiet" disabled={disabled || active} onClick={onRestart}>
            重新开始沟通
          </Button>
        )}
      </section>
    </>
  );
}

export function BriefStep({
  draft,
  disabled,
  active,
  onRevise,
  onConfirm,
  onBack,
  onNext,
}: {
  draft: Draft;
  disabled: boolean;
  active: boolean;
  onRevise: (instructions: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const brief = draft.consultation?.brief;
  const confirmed = briefConfirmed(draft);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    setInstructions('');
  }, [draft.consultation?.revision]);

  if (!brief)
    return (
      <>
        <SectionTitle
          eyebrow="第 3 步 / 共 5 步"
          title="网站方案"
          description="需求沟通完成后，这里会显示可确认的网站方案。"
        />
        <section className="panel">
          <Notice tone="warning">尚未生成网站方案。</Notice>
          <Button onClick={onBack}>返回需求沟通</Button>
        </section>
      </>
    );

  return (
    <>
      <SectionTitle
        eyebrow="第 3 步 / 共 5 步"
        title="网站方案"
        description="检查网站要讲什么、为谁设计、哪些细节必须保留，以及最终页面清单。"
      />
      {confirmed && (
        <Notice tone="success">该方案已确认，文案、译文、品牌色与设计方向已应用到草稿。</Notice>
      )}
      <BriefOverview brief={brief} />
      <section className="panel brief-pages">
        <div className="panel-title">
          <span className="section-index">B</span>
          <h3>页面清单与文案</h3>
          <span>{brief.pages.length} 类页面</span>
        </div>
        {brief.pages.map((page, index) => (
          <article key={page.id}>
            <div>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h4>{pageLabel(draft, page.id)}</h4>
              <small>{page.id.startsWith('extra-') ? '扩展页面' : '基础页面'}</small>
            </div>
            <p>{page.purpose}</p>
            {draft.languages.map((language) => {
              const content = page.content[language];
              return content ? (
                <details key={language}>
                  <summary>
                    {language.toUpperCase()} · {content.title}
                  </summary>
                  {content.sections.map((section, sectionIndex) => (
                    <div key={`${section.heading}-${sectionIndex}`}>
                      <strong>{section.heading}</strong>
                      <p>{section.body}</p>
                    </div>
                  ))}
                </details>
              ) : null;
            })}
          </article>
        ))}
      </section>
      <section className="panel brief-copy">
        <div className="panel-title">
          <span className="section-index">C</span>
          <h3>网站文案与产品译文</h3>
        </div>
        {draft.languages.map((language) => (
          <details key={language}>
            <summary>{language.toUpperCase()} 文案</summary>
            <CopyReview brief={brief} draft={draft} language={language} />
          </details>
        ))}
      </section>
      <section className="panel">
        <div className="panel-title">
          <span className="section-index">D</span>
          <h3>修改或确认</h3>
        </div>
        <Field label="方案修改意见" hint="提交后会生成新方案，已有确认和页面设计会失效。">
          <textarea
            rows={4}
            maxLength={4000}
            value={instructions}
            disabled={disabled || active}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="例如：首页更强调主产品，不要使用工厂产能表述"
          />
        </Field>
        <div className="panel-title-actions">
          <Button
            disabled={disabled || active || !instructions.trim()}
            busy={active && !!instructions.trim()}
            onClick={() => onRevise(instructions.trim())}
          >
            提交修改意见
          </Button>
          <Button kind="primary" disabled={disabled || active || confirmed} onClick={onConfirm}>
            <Icon name="check" />
            {confirmed ? '网站方案已确认' : '确认网站方案'}
          </Button>
        </div>
      </section>
      <div className="step-footer">
        <p>{confirmed ? '方案已确认，可以设计首页。' : '确认方案后才能生成页面设计稿。'}</p>
        <Button kind="primary" disabled={!confirmed || disabled} onClick={onNext}>
          准备页面设计稿
          <Icon name="arrow" />
        </Button>
      </div>
    </>
  );
}

function BriefOverview({ brief }: { brief: SiteBrief }) {
  return (
    <section className="panel brief-overview">
      <div className="panel-title">
        <span className="section-index">A</span>
        <h3>方案摘要</h3>
        <span className="brief-color">
          <i style={{ background: brief.brandColor }} />
          {brief.brandColor}
        </span>
      </div>
      <dl>
        <div>
          <dt>网站概要</dt>
          <dd>{brief.summary}</dd>
        </div>
        <div>
          <dt>目标受众</dt>
          <dd>{brief.audience}</dd>
        </div>
        <div>
          <dt>核心目标</dt>
          <dd>{brief.goal}</dd>
        </div>
        <div>
          <dt>视觉方向</dt>
          <dd>{brief.visualDirection}</dd>
        </div>
        <div>
          <dt>布局与层级</dt>
          <dd>{brief.layout}</dd>
        </div>
      </dl>
      <div className="brief-conditions">
        <div>
          <h4>必须保留</h4>
          <ul>
            {brief.keep.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>需要避免</h4>
          <ul>
            {brief.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CopyReview({
  brief,
  draft,
  language,
}: {
  brief: SiteBrief;
  draft: Draft;
  language: keyof SiteBrief['copy'];
}) {
  const copy = brief.copy[language];
  return (
    <div className="brief-language-copy">
      {copy && (
        <>
          <h4>{copy.headline}</h4>
          <p>{copy.subtitle}</p>
          <p>{copy.about}</p>
          <strong>{copy.cta}</strong>
        </>
      )}
      <ul>
        {draft.products.map((product) => {
          const translation = brief.productTranslations[product.id]?.[language];
          return translation ? (
            <li key={product.id}>
              <strong>{translation.name}</strong>
              <span>{translation.description}</span>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}
