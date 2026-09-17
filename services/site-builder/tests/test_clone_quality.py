import pytest
import asyncio
from clone_quality import render_html, validate_payload, review

def test_validation_and_network_isolation():
    with pytest.raises(ValueError): validate_payload({'files': {'../escape.html':'<html></html>'}})
    with pytest.raises(ValueError): validate_payload({'files': {'index.html':'<html></html>'},'assets':{'x':'https://localhost/image'}})
    value=render_html('<html><head><script>evil()</script></head><body><img onerror="evil()" src="__WR_ASSET_image__"><iframe src="http://localhost"></iframe></body></html>',{'image':'data:image/png;base64,AAAA'})
    assert 'evil()' not in value and '<iframe' not in value
    assert "default-src 'none'" in value and 'data:image/png;base64,AAAA' in value

def test_real_browser_checks_three_widths_without_claiming_fidelity():
    result=asyncio.run(review({'files':{'en/index.html':'<html><head><style>body{margin:0}main{width:800px}</style></head><body><main><h1>Test</h1><p>Some content</p><img src="https://127.0.0.1/never-read.png"></main></body></html>'}}))
    assert result['status']=='issues'
    assert result['widths']==[390,1440,2560]
    assert len(result['records'])==3
    assert result['visuallyVerified'] is False
    assert '页面横向溢出' in result['records'][0]['issues']
    assert all(row['brokenImages']==1 for row in result['records'])
    assert len(result['screenshots'])==3

def test_quality_endpoint_requires_auth_and_rejects_remote_assets(tmp_path):
    from app import create_app
    from fastapi.testclient import TestClient
    async def build(_): return {}
    with TestClient(create_app(tmp_path/'quality.sqlite3',key='quality-test',build=build)) as client:
        assert client.post('/v1/clone-quality',json={}).status_code==401
        assert client.post('/v1/clone-quality',headers={'Authorization':'Bearer quality-test'},json={'files':{'en/index.html':'<html></html>'},'assets':{'x':'https://127.0.0.1/secret'}}).status_code==422
