export BASE_DOMAIN=https://YOURURL/dev
echo $BASE_DOMAIN

http POST $BASE_DOMAIN/events < events/identify.json
http POST $BASE_DOMAIN/events < events/track.json