
export $(cat .env | xargs)

export ptag=pid-static-mechanism-solver-client;
nohup php -S localhost:8085 -t public -- $ptag &> /dev/null &

PHP_SERVER_PID=$!

echo 'PHP SERVER ID:' $PHP_SERVER_PID;
