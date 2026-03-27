-- Mettre à jour les prix des variants qui sont à 0 ou NULL
-- en utilisant le prix du produit parent

UPDATE product_variants pv
SET price = p.price
FROM products p
WHERE pv.productId = p.id
AND (pv.price = 0 OR pv.price IS NULL)
AND p.price IS NOT NULL
AND p.price > 0;

-- Vérifier le résultat
SELECT 
    pv.id,
    pv.name,
    pv.sku,
    pv.price as variant_price,
    p.price as product_price,
    p.name as product_name
FROM product_variants pv
JOIN products p ON pv.productId = p.id
WHERE pv.productId = p.id
ORDER BY p.name, pv.name;
