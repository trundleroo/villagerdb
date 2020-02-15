bin/util build-redis-db
bin/util delete-search-index
bin/util build-search-index
npx nodemon --inspect=0.0.0.0 bin/www
