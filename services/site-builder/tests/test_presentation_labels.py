import copy

import pytest

from assembler import OutputValidationError
from presentation_labels import presentation_label_candidates, presentation_label_sources, validate_presentation_labels


@pytest.fixture(autouse=True)
def english_site(draft):
    draft['languages'] = ['en']


def labels(*texts):
    return [{'id': f'label-{index}', 'text': {'en': text}} for index, text in enumerate(texts)]


def test_source_phrases_preserve_display_case_and_punctuation(guided_draft):
    home = guided_draft['consultation']['brief']['pages'][0]
    home['content']['en']['sections'] = [{
        'heading': 'Product focus',
        'body': 'The range highlights visible hydration tracking, functional lid variety, and active-use bottles.',
    }]
    items = labels('Hydration Tracking', 'Functional Lid Variety', 'Active–Use Bottles')
    assert validate_presentation_labels(items, guided_draft) == {item['id']: item['text'] for item in items}


def test_allowed_sources_include_copy_product_facts_company_category_and_ui(guided_draft):
    guided_draft['category'] = 'Water bottles'
    guided_draft['consultation']['brief']['copy']['en']['cta'] = 'Browse Acme products'
    items = labels('Build <together>', 'Block <One>', 'Wood', '10 cm', 'Acme <&>', 'Approved company', 'Water Bottles', 'Browse Acme Products', 'Send Inquiry', 'Our story')
    assert len(validate_presentation_labels(items, guided_draft)) == len(items)


@pytest.mark.parametrize('text', ['FDA approved', '100% success rate', 'Active-Use Ready', 'Buy Acme Today'])
def test_unapproved_claims_or_rewritten_ctas_are_rejected(guided_draft, text):
    before = copy.deepcopy(guided_draft)
    with pytest.raises(OutputValidationError, match='approved') as captured:
        validate_presentation_labels(labels(text), guided_draft)
    assert text not in str(captured.value)
    assert guided_draft == before


def test_original_history_internal_instructions_and_unknown_fields_are_not_sources(guided_draft):
    guided_draft['products'][0]['source'] = {'conditions': {'keep': 'FDA approved'}, 'history': 'FDA approved'}
    guided_draft['products'][0]['description'] = 'FDA approved'
    guided_draft['copy']['en']['hiddenPayload'] = 'FDA approved'
    brief = guided_draft['consultation']['brief']
    brief['keep'] = ['FDA approved']
    brief['summary'] = 'FDA approved'
    brief['pages'][0]['purpose'] = 'FDA approved'
    with pytest.raises(OutputValidationError, match='approved'):
        validate_presentation_labels(labels('FDA approved'), guided_draft)
    assert not any('FDA approved' in source for source in presentation_label_sources(guided_draft, 'en'))


@pytest.mark.parametrize('source,quote', [
    ('This bottle is not waterproof.', 'Waterproof'),
    ('This bottle is not yet fully FDA certified.', 'FDA Certified'),
    ('Waterproof performance is unknown.', 'Waterproof'),
    ('Unverified 100% success rate.', '100% Success Rate'),
    ('FDA certification is pending.', 'FDA Certification'),
    ('This may be waterproof.', 'Waterproof'),
])
def test_short_quotes_cannot_discard_nearby_negation_or_qualifiers(draft, source, quote):
    draft['copy']['en']['subtitle'] = source
    with pytest.raises(OutputValidationError, match='approved'):
        validate_presentation_labels(labels(quote), draft)
    assert validate_presentation_labels(labels(source), draft) == {'label-0': {'en': source}}


def test_phrase_matching_does_not_join_separate_facts_or_partial_words(draft):
    draft['copy']['en']['headline'] = 'A waterproof bottle'
    draft['copy']['en']['subtitle'] = 'Hydration'
    draft['copy']['en']['about'] = 'Tracking'
    for text in ('water', 'Hydration Tracking'):
        with pytest.raises(OutputValidationError, match='approved'):
            validate_presentation_labels(labels(text), draft)


def test_punctuation_normalization_does_not_create_numeric_claims(draft):
    draft['copy']['en']['subtitle'] = 'A 1.5 litre bottle. Product range 100.'
    assert validate_presentation_labels(labels('1.5 litre'), draft) == {'label-0': {'en': '1.5 litre'}}
    for text in ('15 litre', '100%'):
        with pytest.raises(OutputValidationError, match='approved'):
            validate_presentation_labels(labels(text), draft)


@pytest.mark.parametrize('value', [
    None, {}, 'quote', [None], [{'id': 'a', 'text': ''}], [{'id': 'a', 'text': '   '}],
    [{'id': 'a', 'text': 1}], [{'id': 'a', 'text': 'x' * 101}],
    [{'id': '../escape', 'text': 'Home'}], [{'id': 'A', 'text': 'Home'}],
    [{'id': 'x' * 65, 'text': 'Home'}], [{'id': 'a', 'text': 'Home', 'claim': 'FDA approved'}],
    [{'id': 'a', 'text': 'Home'}, {'id': 'a', 'text': 'Home'}],
    [{'id': 'a', 'text': 'Home\u200b'}], [{'id': 'a', 'text': 'Home\x00'}],
    [{'id': f'label-{index}', 'text': 'Home'} for index in range(25)],
])
def test_invalid_registry_is_rejected_with_fixed_safe_errors(draft, value):
    with pytest.raises(OutputValidationError) as captured:
        validate_presentation_labels(value, draft)
    assert 'FDA' not in str(captured.value) and '../escape' not in str(captured.value)


def test_empty_registry_is_valid_and_whitespace_is_normalized(draft):
    assert validate_presentation_labels([], draft) == {}
    assert validate_presentation_labels(labels('  Email\nAddress  '), draft) == {'label-0': {'en': 'Email\nAddress'}}


def test_labels_are_grounded_in_each_pages_language(draft):
    draft['languages'] = ['en', 'de']
    items = [
        {'id': 'cta', 'text': {'en': 'Explore', 'de': 'Entdecken'}},
        {'id': 'product', 'text': {'en': 'Block <One>', 'de': 'Baustein Eins'}},
        {'id': 'material', 'text': {'en': 'Wood', 'de': 'Wood'}},
    ]
    assert validate_presentation_labels(items, draft) == {item['id']: item['text'] for item in items}
    assert 'Explore' not in presentation_label_sources(draft, 'de')
    items[0]['text']['de'] = 'Explore'
    with pytest.raises(OutputValidationError, match='approved'):
        validate_presentation_labels(items, draft)


@pytest.mark.parametrize('text', ['Home', {'en': 'Home'}, {'en': 'Home', 'de': 'Startseite', 'fr': 'Accueil'}, {'en': 'Home', 'de': ''}])
def test_multilingual_labels_require_exact_language_coverage(draft, text):
    draft['languages'] = ['en', 'de']
    with pytest.raises(OutputValidationError):
        validate_presentation_labels([{'id': 'home', 'text': text}], draft)


def test_localized_qualifiers_cannot_be_dropped(draft):
    draft['languages'] = ['en', 'de']
    draft['copy']['de']['subtitle'] = 'Die Flasche ist nicht wasserdicht.'
    with pytest.raises(OutputValidationError, match='approved'):
        validate_presentation_labels([{'id': 'feature', 'text': {'en': 'Explore', 'de': 'Wasserdicht'}}], draft)
    result = validate_presentation_labels([{'id': 'feature', 'text': {'en': 'Explore', 'de': 'Nicht wasserdicht'}}], draft)
    assert result['feature']['de'] == 'Nicht wasserdicht'


def test_single_language_string_compatibility_returns_localized_registry(draft):
    assert validate_presentation_labels([{'id': 'home', 'text': 'Home'}], draft) == {'home': {'en': 'Home'}}


def test_candidates_include_approved_feature_phrases_and_cta(guided_draft):
    guided_draft['copy']['en']['subtitle'] = 'A showcase for hydration tracking, functional lids, and active-use bottle versions.'
    guided_draft['copy']['en']['cta'] = 'Send Wholesale Inquiry'
    page = guided_draft['consultation']['brief']['pages'][0]
    page['content']['en']['sections'] = [
        {'heading': 'Product Focus', 'body': 'The range highlights visible hydration tracking, functional lid variety, and paperboard packaging.'},
        {'heading': 'Active-Use Bottles', 'body': 'Browse the assortment.'},
    ]
    candidates = presentation_label_candidates(guided_draft, 'en')
    assert {'Hydration Tracking', 'Functional Lid Variety', 'Active-Use Bottles', 'Send Wholesale Inquiry'} <= set(candidates.values())
    for identity, text in candidates.items():
        assert validate_presentation_labels([{'id': identity, 'text': {'en': text}}], guided_draft) == {identity: {'en': text}}


def test_candidates_are_generic_bounded_and_ids_survive_source_reordering(guided_draft):
    guided_draft['copy']['en']['subtitle'] = 'Made with natural grain, stackable tray design, and practical storage.'
    guided_draft['products'] = [{**copy.deepcopy(guided_draft['products'][0]), 'id': f'item-{index}', 'name': f'Product {index}'} for index in range(100)]
    before = copy.deepcopy(guided_draft)
    first = presentation_label_candidates(guided_draft, 'en')
    assert {'Natural Grain', 'Stackable Tray Design'} <= set(first.values())
    assert len(first) <= 100 and len(first) == len(set(first.values()))
    assert guided_draft == before
    guided_draft['products'].reverse()
    second = presentation_label_candidates(guided_draft, 'en')
    assert {text: identity for identity, text in first.items() if text in second.values()} == {text: identity for identity, text in second.items() if text in first.values()}


def test_candidates_do_not_offer_unapproved_or_unqualified_claims(draft):
    draft['copy']['en']['subtitle'] = 'This bottle is not waterproof, FDA certification is pending, and 100% success rate is unverified.'
    draft['products'][0]['source'] = {'conditions': {'keep': 'FDA approved'}}
    candidates = presentation_label_candidates(draft, 'en')
    assert not {'Waterproof', 'FDA Certification', '100% Success Rate', 'FDA approved'} & set(candidates.values())
    assert all(len(text) <= 100 for text in candidates.values())


def test_candidates_are_language_scoped(draft):
    draft['languages'] = ['en', 'de']
    english = presentation_label_candidates(draft, 'en')
    german = presentation_label_candidates(draft, 'de')
    assert 'Explore' in english.values() and 'Explore' not in german.values()
    assert 'Entdecken' in german.values() and 'Entdecken' not in english.values()
    assert not set(english).intersection(german)


def test_candidate_fallback_cannot_offer_long_material_statements(draft):
    material = 'Stainless steel bottle body; lid material to be confirmed; paperboard packaging'
    draft['products'][0]['material'] = material
    draft['copy']['en']['subtitle'] = 'Not waterproof'
    draft['copy']['en']['headline'] = 'An exceptionally-long-but-approved-presentation-description-value'
    candidates = presentation_label_candidates(draft, 'en')
    assert material not in candidates.values()
    assert draft['copy']['en']['headline'] not in candidates.values()
    assert 'Not waterproof' in candidates.values()
    assert all(len(text) <= 60 and len(text.split()) <= 6 for text in candidates.values())
    # The candidate suitability filter does not narrow the existing binding contract.
    assert validate_presentation_labels(labels(material), draft) == {'label-0': {'en': material}}
