"""Short presentation labels quoted from the site's approved text only."""
import hashlib
import re
import unicodedata
from typing import Any


def presentation_label_sources(draft: dict[str, Any], language: str) -> list[str]:
    # Import lazily: the assembler also uses this module at its binding boundary.
    from assembler import LABELS, OutputValidationError

    if language not in draft.get('languages', []):
        raise OutputValidationError('Unsupported presentation label language')

    sources: list[str] = []
    def add(value: Any) -> None:
        if isinstance(value, str) and value.strip():
            sources.append(value)

    company = draft.get('company', {})
    for key in ('name', 'description'):
        add(company.get(key))
    add(draft.get('category'))
    brief = (draft.get('consultation') or {}).get('brief') or {}
    for copy in (draft.get('copy', {}), brief.get('copy', {})):
        for key in ('headline', 'subtitle', 'about', 'cta'):
            add(copy.get(language, {}).get(key))
    for product in draft.get('products', []):
        for key in ('material', 'dimensions'):
            add(product.get(key))
        if language == 'en':
            add(product.get('name'))
        else:
            add(product.get('translations', {}).get(language, {}).get('name'))
    for page in brief.get('pages', []):
        content = page.get('content', {}).get(language, {})
        add(content.get('title'))
        for section in content.get('sections', []):
            add(section.get('heading'))
            add(section.get('body'))
    for value in LABELS.get(language, {}).values():
        add(value)
    return list(dict.fromkeys(sources))


def _normalized(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).casefold()
    characters = []
    for index, character in enumerate(value):
        # Percentages and decimal values keep their meaning while typographic
        # punctuation, hyphens and whitespace can differ in compact labels.
        decimal = character in '.,' and index > 0 and index + 1 < len(value) and value[index - 1].isdigit() and value[index + 1].isdigit()
        if unicodedata.category(character).startswith('P') and character != '%' and not decimal:
            characters.append(' ')
        else:
            characters.append(character)
    return ' '.join(''.join(characters).split())


QUALIFIERS = {'not', 'no', 'never', 'without', 'unknown', 'unconfirmed', 'uncertified', 'unverified', 'unproven', 'pending', 'may', 'might', 'potentially'}
LOCALIZED_QUALIFIERS = {
    'de': {'nicht', 'kein', 'keine', 'keinen', 'keinem', 'keiner', 'ohne', 'unbekannt', 'unbestätigt', 'ungeprüft', 'möglicherweise'},
    'fr': {'pas', 'non', 'sans', 'jamais', 'inconnu', 'inconnue', 'incertain', 'incertaine', 'peut'},
    'es': {'no', 'nunca', 'sin', 'desconocido', 'desconocida', 'pendiente', 'puede', 'podría'},
    'pt': {'não', 'nunca', 'sem', 'desconhecido', 'desconhecida', 'pendente', 'pode', 'poderia'},
    'it': {'non', 'mai', 'senza', 'sconosciuto', 'sconosciuta', 'incerto', 'incerta', 'possibile', 'forse'},
}


def _quoted_from(label: str, source: str, language: str) -> bool:
    quote = _normalized(label)
    if quote == _normalized(source):
        return True
    # Do not join sentences or extract a positive claim by dropping a nearby
    # negation/uncertainty qualifier. Complete approved labels retain qualifiers.
    for sentence in re.split(r'(?<=[.!?;])\s+', source):
        normalized = _normalized(sentence)
        for match in re.finditer(r'(?<!\S)' + re.escape(quote) + r'(?!\S)', normalized):
            nearby = normalized[:match.start()].split()[-4:] + normalized[match.end():].split()[:4]
            qualifiers = QUALIFIERS | LOCALIZED_QUALIFIERS.get(language, set())
            if not (set(nearby) & qualifiers) - set(quote.split()):
                return True
    return False


def presentation_label_candidates(draft: dict[str, Any], language: str) -> dict[str, str]:
    """Offer bounded, verified choices; the planner selects IDs instead of writing text."""
    sources = presentation_label_sources(draft, language)
    product_names = {
        product.get('name') if language == 'en' else product.get('translations', {}).get(language, {}).get('name')
        for product in draft.get('products', [])
    }
    primary_sources = [source for source in sources if source not in product_names]
    result: dict[str, str] = {}

    def add(text: str, source: str) -> None:
        text = ' '.join(text.split())
        if len(result) >= 100 or not text or len(text) > 60 or len(text.split()) > 6 or not any(character.isalnum() for character in text) or any(unicodedata.category(character).startswith('C') for character in text):
            return
        if not _quoted_from(text, source, language):
            return
        identity = 'p-' + hashlib.sha256((language + '\0' + text).encode()).hexdigest()[:16]
        result[identity] = text

    # Keep space for useful body phrases: a large catalog must not consume the
    # entire choice list with product names before the page's feature labels.
    for source in primary_sources:
        if len(result) < 60 and len(source.split()) <= 6:
            add(source, source)

    function_words = {'a', 'an', 'the', 'and', 'or', 'for', 'with', 'by', 'of', 'to', 'in', 'on', 'at', 'is', 'are'}
    for source in primary_sources:
        for clause in re.split(r'(?<!\d)[,;:.!?](?!\d)|[，；：。！？]', source):
            clause = re.sub(r'^\s*(?:and|or)\s+', '', clause, flags=re.I).strip()
            phrases = [clause]
            phrases.extend(clause[match.end():] for match in re.finditer(r'\b(?:for|with|by|including|through|visible)\s+', clause, re.I))
            for phrase in phrases:
                words = phrase.split()
                if not 2 <= len(words) <= 6 or words[0].casefold() in function_words or words[-1].casefold() in function_words:
                    continue
                # Display casing may change; characters and word order still
                # have to match the exact approved source via _quoted_from.
                title = re.sub(r"(?<![\w'’])[^\W\d_]", lambda match: match[0].upper(), phrase)
                add(title, source)

    for source in sources:
        add(source, source)
    return result


def validate_presentation_labels(labels: Any, draft: dict[str, Any]) -> dict[str, dict[str, str]]:
    """Validate the entire registry before any label is trusted for HTML binding."""
    from assembler import OutputValidationError

    if not isinstance(labels, list) or len(labels) > 24:
        raise OutputValidationError('Invalid presentation label registry')
    languages = draft['languages']
    sources = {language: presentation_label_sources(draft, language) for language in languages}
    result: dict[str, dict[str, str]] = {}
    for label in labels:
        if not isinstance(label, dict) or set(label) != {'id', 'text'}:
            raise OutputValidationError('Invalid presentation label entry')
        identity, text = label['id'], label['text']
        if not isinstance(identity, str) or re.fullmatch(r'[a-z][a-z0-9-]{0,63}', identity) is None or identity in result:
            raise OutputValidationError('Invalid or duplicate presentation label ID')
        if isinstance(text, str) and len(languages) == 1:
            text = {languages[0]: text}
        if not isinstance(text, dict) or set(text) != set(languages):
            raise OutputValidationError('Presentation label languages must match the approved site languages')
        result[identity] = {}
        for language in languages:
            value = text[language]
            if not isinstance(value, str) or not value.strip() or len(value) > 100 or not any(character.isalnum() for character in value) or any(unicodedata.category(character).startswith('C') and character not in '\t\n\r' for character in value):
                raise OutputValidationError('Invalid presentation label text')
            if not any(_quoted_from(value, source, language) for source in sources[language]):
                raise OutputValidationError('Presentation label must quote approved text without removing a qualification')
            result[identity][language] = value.strip()
    return result
