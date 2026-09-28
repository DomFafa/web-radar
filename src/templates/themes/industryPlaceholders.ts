export type IndustryPlaceholderKey = 'toys' | 'footwear' | 'apparel' | 'plush' | 'universal' | 'drinkware' | 'beauty' | 'electronics' | 'tools' | 'sports';

const INDUSTRY_IMAGES: Record<IndustryPlaceholderKey, string[]> = {
  toys: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format',  // action figures
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80&auto=format',  // collectible toys
    'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&q=80&auto=format',  // robot toy
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80&auto=format',  // toy figurines
    'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&q=80&auto=format',  // vinyl toy
    'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=800&q=80&auto=format',  // designer toy
    'https://images.unsplash.com/photo-1581235707960-15e92f0a3120?w=800&q=80&auto=format',  // toy collection
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80&auto=format',  // colorful toys
  ],
  footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format',  // red nike sneaker
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&auto=format',  // colorful sneaker
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80&auto=format',  // running shoe
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80&auto=format',  // white sneakers
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80&auto=format',  // leather boot
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80&auto=format',  // classic shoe
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80&auto=format',  // sneaker pair
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80&auto=format',  // shoe detail
  ],
  apparel: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80&auto=format',  // clothing rack
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80&auto=format',  // folded shirts
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80&auto=format',  // fashion fabric
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80&auto=format',  // casual wear
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format',  // elegant dress
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80&auto=format',  // t-shirt collection
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80&auto=format',  // luxury fabric
    'https://images.unsplash.com/photo-1434389677669-e08b4cda3a35?w=800&q=80&auto=format',  // designer clothing
  ],
  plush: [
    'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&q=80&auto=format',  // teddy bear
    'https://images.unsplash.com/photo-1585155770913-5f0b578dcc4f?w=800&q=80&auto=format',  // soft plush toy
    'https://images.unsplash.com/photo-1617073397926-90bf7b649943?w=800&q=80&auto=format',  // plush bunny
    'https://images.unsplash.com/photo-1563901935883-cb61f6b2c77f?w=800&q=80&auto=format',  // cushion pillows
    'https://images.unsplash.com/photo-1582845512747-e42001c95638?w=800&q=80&auto=format',  // stuffed animal
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80&auto=format',  // cute plushie
    'https://images.unsplash.com/photo-1602734846297-9299fc2d4f38?w=800&q=80&auto=format',  // throw pillow
    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80&auto=format',  // plush collection
  ],
  universal: [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format',  // modern product
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80&auto=format',  // warehouse goods
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format',  // packaged products
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80&auto=format',  // modern display
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format',  // headphones product
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format',  // watch product
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80&auto=format',  // sunglasses
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80&auto=format',  // product display
  ],
  drinkware: [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80&auto=format',  // ceramic mug
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80&auto=format',  // pottery collection
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80&auto=format',  // artisan ceramic
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80&auto=format',  // handmade cup
    'https://images.unsplash.com/photo-1605478952203-28e1a63efb27?w=800&q=80&auto=format',  // stoneware bowls
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format',  // ceramic set
    'https://images.unsplash.com/photo-1576697020913-37b3bcfab84c?w=800&q=80&auto=format',  // tea set
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80&auto=format',  // handcraft pottery
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format',  // skincare products
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80&auto=format',  // serum bottle
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80&auto=format',  // beauty routine
    'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80&auto=format',  // cosmetic bottles
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80&auto=format',  // natural skincare
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80&auto=format',  // cream jar
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80&auto=format',  // beauty products
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80&auto=format',  // face mask
  ],
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format',  // headphones
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80&auto=format',  // audio equipment
    'https://images.unsplash.com/photo-1585565804112-f201f68c48b4?w=800&q=80&auto=format',  // smart device
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&auto=format',  // tech gear
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80&auto=format',  // gadget
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80&auto=format',  // earbuds
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80&auto=format',  // laptop tech
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80&auto=format',  // circuit board
  ],
  tools: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format',  // precision tools
    'https://images.unsplash.com/photo-1530124566582-a45a7e3f4b02?w=800&q=80&auto=format',  // industrial hardware
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format',  // metal workshop
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format',  // CNC machine
    'https://images.unsplash.com/photo-1513467535987-fd81bc500d7d?w=800&q=80&auto=format',  // power tools
    'https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=800&q=80&auto=format',  // workshop tools
    'https://images.unsplash.com/photo-1597424216809-3ba4c7db5015?w=800&q=80&auto=format',  // hardware parts
    'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80&auto=format',  // tool collection
  ],
  sports: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80&auto=format',  // hiking gear
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50c?w=800&q=80&auto=format',  // outdoor equipment
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80&auto=format',  // cycling
    'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&q=80&auto=format',  // climbing gear
    'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=800&q=80&auto=format',  // trail running
    'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=800&q=80&auto=format',  // backpack
    'https://images.unsplash.com/photo-1560073743-0cda89bb5953?w=800&q=80&auto=format',  // camping equipment
    'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?w=800&q=80&auto=format',  // sports gear
  ],
};

export function getIndustryPlaceholder(industry: IndustryPlaceholderKey, index: number): string {
  const images = INDUSTRY_IMAGES[industry];
  if (!images) return `/templates/placeholders/${industry}-${(Math.abs(index) % 8) + 1}.svg`;
  return images[Math.abs(index) % images.length];
}
