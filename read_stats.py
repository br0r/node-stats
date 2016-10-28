#!/usr/bin/env python
import matplotlib.pyplot as plt
import json
import pandas as pd
import sys
import signal
import time

fname = sys.argv[1]
plt.ion()
fig = plt.figure()
def readStats():
    f = open(fname, 'r')
    m = json.load(f)
    f.close()
    plt.clf()
    data = pd.DataFrame(m['heap']).get('v')
    plt.plot(data)
    fig.canvas.draw()


def handler(signum, frame):
    readStats()
    signal.alarm(2)

signal.signal(signal.SIGALRM, handler)
signal.alarm(1)
readStats()

while True:
    time.sleep(1)
