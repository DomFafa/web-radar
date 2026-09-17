export const interactionScript = `<script>
for(const form of document.querySelectorAll('form[data-wr-inquiry]')){
 let requestId=crypto.randomUUID();
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const button=form.querySelector('[type=submit]');if(button)button.disabled=true;
  let status=form.querySelector('[role=status]');if(!status){status=document.createElement('p');status.setAttribute('role','status');form.append(status)}
  status.textContent='Sending…';
  try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(new FormData(form)),requestId})});if(!response.ok)throw Error();status.textContent='Your inquiry has been received.';form.reset();requestId=crypto.randomUUID()}
  catch{status.textContent='Unable to send. Please try again.'}finally{if(button)button.disabled=false}
 })
}
for(const search of document.querySelectorAll('[data-product-search]'))search.addEventListener('input',()=>{for(const card of document.querySelectorAll('[data-product-card]'))card.hidden=!(card.dataset.productName||card.textContent).toLowerCase().includes(search.value.toLowerCase())});
</script>`;
