export ptag=pid-static-mechanism-solver-client;
kill $(ps aux | grep -E "[l]ocalhost:8085 -t public" | awk '{print $2}')
