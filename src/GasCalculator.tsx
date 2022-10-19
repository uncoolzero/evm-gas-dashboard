import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { ethers, BigNumber } from 'ethers'

interface Props {
    chain: string
}

function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}

function GasCalculator({chain}: Props) {


const chains = [
    {key: "eth", chainName: "Ethereum", rpc: "https://rpc.ankr.com/eth"},
    {key: "bsc", chainName: "BNB Chain", rpc: "https://bsc-dataseed.binance.org/"},
    {key: "polygon", chainName: "Polygon", rpc: "https://rpc.ankr.com/polygon"},
    {key: "avax", chainName: "Avalanche", rpc: "https://rpc.ankr.com/avalanche"},
    {key: "arbitrumone", chainName: "Arbitrum", rpc: "https://rpc.ankr.com/arbitrum"},
    {key: "cronos", chainName: "Cronos", rpc: "https://evm.cronos.org"},
    {key: "ftm", chainName: "Fantom", rpc: "https://rpc.ankr.com/fantom"},
    {key: "metis", chainName: "Metis", rpc: "https://andromeda.metis.io/?owner=1088"},
]

const [fast, setFastGas] = useState("0.0")
const [medium, setMediumGas] = useState("0.0")
const [slow, setSlowGas] = useState("0.0")

const [chainName, setChainName] = useState("")

const rpc = useRef("")

const [loading, setLoading] = useState(true)

function setChain() {
    for (let i = 0; i < chains.length; i++)
    {
        if (chains[i].key === chain)
        {
            rpc.current = chains[i].rpc
            setChainName(chains[i].chainName)
        }
    }  
}

async function getGas() {

  if (rpc)
  {
    setLoading(true)
    //console.log("calculating chain - ", chainName)
    const provider = new ethers.providers.JsonRpcProvider(rpc.current)

    const fastPercentile = 0.15
    const slowPercentile = 0.15
    const percentToFilter = 0.15
    const blockHistory = 10

    var blockNumber = await provider.getBlockNumber()

    var gasPrices = []


    for (let i = 0; i < blockHistory; i++)
    {
        var block = await provider.getBlockWithTransactions(blockNumber - i)

        if (block.transactions)
        {
            for (let u = 0; u < block.transactions.length; u++)
            {
                gasPrices.push(block.transactions[u].gasPrice)
            }
        }

    }


    var fastGas = ethers.constants.Zero
    var mediumGas = ethers.constants.Zero
    var slowGas = ethers.constants.Zero


    //sorting gas prices, slowest (cheapest) gas price first
    gasPrices.sort((a, b) => {
        //@ts-ignore
        if (a.lt(b)) {
            return -1;
        }
        //@ts-ignore
        if (a.gt(b)) {
            return 1;
        }

        return 0;

    })

    //removing extreme outliers
    for (let i = 0; i < (Math.round(gasPrices.length * percentToFilter)); i++)
    {
        gasPrices.shift()
        gasPrices.pop()
    }


    var fastestTx = Math.round(gasPrices.length * fastPercentile)
    var slowestTx = Math.round(gasPrices.length * slowPercentile)

    if (fastestTx === 0)
    {
        fastestTx = gasPrices.length
    }

    if (slowestTx === 0)
    {
        slowestTx = gasPrices.length
    }

    for (let i = (gasPrices.length - fastestTx); i < gasPrices.length; i++)
    {
        //@ts-ignore
        fastGas = fastGas.add(gasPrices[i])
    }

    fastGas = fastGas.div(BigNumber.from(fastestTx))

    for (let i = 0; i < slowestTx; i++)
    {
        //@ts-ignore
        slowGas = slowGas.add(gasPrices[i])
    }

    slowGas = slowGas.div(BigNumber.from(slowestTx))

    for (let i = slowestTx; i < (gasPrices.length - fastestTx); i++)
    {
        //@ts-ignore
        mediumGas = mediumGas.add(gasPrices[i])
    }

    mediumGas = mediumGas.div(BigNumber.from(gasPrices.length - fastestTx - slowestTx))

    //console.log("data for chain -", chainName)
    //console.log("fast gas - ", ethers.utils.formatUnits(fastGas, "gwei"))
    //console.log("medium gas -", ethers.utils.formatUnits(mediumGas, "gwei"))
    //console.log("slow gas - ", ethers.utils.formatUnits(slowGas, "gwei"))

    var fastGasString = parseFloat(ethers.utils.formatUnits(fastGas, "gwei")).toFixed(2)
    var mediumGasString = parseFloat(ethers.utils.formatUnits(mediumGas, "gwei")).toFixed(2)
    var slowGasString = parseFloat(ethers.utils.formatUnits(slowGas, "gwei")).toFixed(2)

    setFastGas(fastGasString)
    setMediumGas(mediumGasString)
    setSlowGas(slowGasString)

    setLoading(false)
    timeout(60000)
  }
  else
  {
    console.log("rpc not detected")
  }
}

useEffect(() => {

    setChain()
    getGas()

}, [])

useEffect(() => {

    const updateInterval = setInterval(() => {
        getGas()
    }, 60000)

    return () => clearInterval(updateInterval)

}, [])

  return (
        <div className={`px-2 rounded-md shadow-sm ${chain} z-50`}>
            <div className="text-xl pt-2 font-bold">{chainName}</div>
            <div className="flex flex-row gap-4 p-2 justify-evenly">
                <div className="flex-col">
                    <div>Fast</div>
                    {loading ? <div className="bg-neutral-800 rounded-md px-7 animate-pulse text-transparent">-</div> : <div>{fast}</div>}
                </div>
                <div className="flex-col">
                    <div>Medium</div>
                    {loading ? <div className="bg-neutral-800 rounded-md px-7 animate-pulse text-transparent">-</div> : <div>{medium}</div>}
                </div>
                <div className="flex-col">
                    <div>Slow</div>
                    {loading ? <div className="bg-neutral-800 rounded-md px-7 animate-pulse text-transparent">-</div> : <div>{slow}</div>}
                </div>
            </div>
        </div>
  )

}

export default GasCalculator