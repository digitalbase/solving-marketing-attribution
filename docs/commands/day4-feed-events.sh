// easy way (all in one go)
for d in ./events/* ; do (http POST $BASE_DOMAIN/events < "$d" ); done

// hard way (one by one)
http POST $BASE_DOMAIN/events < events/anon_page_1.json
http POST $BASE_DOMAIN/events < events/anon_page_2.json
...