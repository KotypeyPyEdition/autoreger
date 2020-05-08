import asyncio
import concurrent.futures
import os

a = 50

def run():
    os.system("node index.js")
async def main():

    with concurrent.futures.ThreadPoolExecutor() as pool:
        for i in range(a):
            await loop.run_in_executor(pool, run)


loop = asyncio.get_event_loop()
loop.run_until_complete(main())