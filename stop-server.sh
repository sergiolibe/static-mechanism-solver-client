export ptag=pid-static-mechanism-solver-client;
kill $(ps aux | grep -E "[-]- $ptag" | awk '{print $2}')
