export BASE_DOMAIN=https://YOURURL/dev
echo $BASE_DOMAIN

http POST $BASE_DOMAIN/events < docs/events/identify.json
http POST $BASE_DOMAIN/events < docs/events/track.json