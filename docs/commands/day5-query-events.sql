// file 1
SELECT * FROM prezly_prod_frontend.pages WHERE date_part('year', timestamp) = 2019 LIMIT 500000;
// file 2
SELECT * FROM prezly_prod_frontend.pages WHERE date_part('year', timestamp) = 2019 LIMIT 500000 OFFSET 500000;