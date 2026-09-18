import type { MaterialsMedia } from '../shared/materials';
import { ApiError } from './http';
import { limitedBytes } from './providers/http';
import { ProviderError } from './provider-contract';

function dimensions(bytes:Uint8Array,mime:string):{width:number;height:number}|undefined{
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ascii=(i:number,n:number)=>String.fromCharCode(...bytes.slice(i,i+n));
  if(mime==='image/png'&&bytes.length>=33&&ascii(1,3)==='PNG'&&bytes[0]===137&&ascii(12,4)==='IHDR')return{width:view.getUint32(16),height:view.getUint32(20)};
  if(mime==='image/jpeg'&&bytes[0]===255&&bytes[1]===216){
    let i=2;
    while(i+4<bytes.length){
      if(bytes[i]!==255)return;
      while(bytes[i]===255)i++;
      const marker=bytes[i++];if(marker===217||marker===218)return;
      if(marker===1||(marker>=208&&marker<=215))continue;
      if(i+2>bytes.length)return;const length=view.getUint16(i);if(length<2||i+length>bytes.length)return;
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&length>=8)return{width:view.getUint16(i+5),height:view.getUint16(i+3)};
      i+=length;
    }
  }
  if(mime==='image/webp'&&bytes.length>=30&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP'){
    const kind=ascii(12,4);
    if(kind==='VP8X')return{width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)};
    if(kind==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return{width:view.getUint16(26,true)&16383,height:view.getUint16(28,true)&16383};
    if(kind==='VP8L'&&bytes[20]===47)return{width:1+bytes[21]+((bytes[22]&63)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)};
  }
  if(['image/x-icon','image/vnd.microsoft.icon'].includes(mime)&&bytes.length>=22&&view.getUint16(0,true)===0&&view.getUint16(2,true)===1&&view.getUint16(4,true)>0)return{width:bytes[6]||256,height:bytes[7]||256};
}
export async function checkedMaterialsMedia(response:Response,media:MaterialsMedia):Promise<Uint8Array>{
  const mime=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  const length=response.headers.get('content-length');
  if(mime!==media.mimeType||(length!==null&&Number(length)!==media.bytes)){await response.body?.cancel();throw new ApiError(409,'media_metadata_conflict','来源图片类型或大小已改变。');}
  let bytes:Uint8Array;
  try{bytes=await limitedBytes(response,Math.min(media.bytes+1,20*1024*1024));}
  catch(error){if(error instanceof ProviderError&&error.code==='provider_payload_too_large')throw new ApiError(409,'media_size_conflict','来源图片大小不一致。');throw error;}
  if(bytes.length!==media.bytes)throw new ApiError(409,'media_size_conflict','来源图片大小不一致。');
  const size=dimensions(bytes,media.mimeType);
  if(!size||size.width!==media.width||size.height!==media.height)throw new ApiError(409,'media_dimensions_conflict','来源图片格式或尺寸不一致。');
  const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))].map(v=>v.toString(16).padStart(2,'0')).join('');
  if(digest!==media.sha256)throw new ApiError(409,'media_hash_conflict','来源图片内容已改变，请重新确认资料。');
  return bytes;
}
