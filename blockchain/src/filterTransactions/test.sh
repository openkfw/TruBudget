#!/bin/bash
start=`date +%s`
for i in $(seq 1 1 10000)
do
  ./filterScript &
done
end=`date +%s`
echo Execution time was `expr $end - $start` seconds.
