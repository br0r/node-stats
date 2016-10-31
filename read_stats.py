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
    plt.subplot(211)
    plt.title("Heap")
    plt.plot(data)

    plt.subplot(212)
    plt.title("Block")
    df = pd.DataFrame(m['block']).get('v')
    if df is not None and len(df) > 1:
        plt.hist(df)
    fig.canvas.draw()

def handler(signum, frame):
    readStats()

signal.signal(signal.SIGUSR1, handler)

while True:
    try:
        time.sleep(1)
    except KeyboardInterrupt:
        sys.exit(0)
