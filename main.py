import asyncio
import concurrent.futures
import os
import threading
a = 50

def run(loop: asyncio.AbstractEventLoop):

    def call():
        os.system('node index.js')
    with concurrent.futures.ThreadPoolExecutor() as pool:
        loop.run_in_executor(None, call)
async def main(loop):
    for i in range(a):
        await callThread(loop)

async def callThread(loop):
    threading.Thread(target=run, args=(loop,)).start()
loop = asyncio.get_event_loop()
loop.run_until_complete(main(loop))