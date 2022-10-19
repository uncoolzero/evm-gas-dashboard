import './App.css'
import GasCalculator from './GasCalculator'

function App() {

  return (
    <div className="App">
      <div className="mt-0 pb-1 text-4xl font-bold">EVM GAS CRISIS DASHBOARD</div>
      <div className="mt-0 pb-8 text-base font-light">Actually there isn't a gas crisis, but if there was one, you would see it here</div>
      <div className="mt-0 text-base font-bold">All values in Gwei</div>
      <div className="mt-0 pb-8 text-base font-bold">Updated every 60 seconds</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GasCalculator chain="eth"/>
          <GasCalculator chain="bsc"/>
          <GasCalculator chain="polygon"/>
          <GasCalculator chain="avax"/>
          <GasCalculator chain="arbitrumone"/>
          <GasCalculator chain="cronos"/>
          <GasCalculator chain="ftm"/>
          <GasCalculator chain="metis"/>
      </div>
      <div className="text-xs ml-auto mr-auto pt-8 md:absolute md:bottom-0 left-0 right-0">
        <a className="text-neutral-500 hover:cursor-pointer" href="https://twitter.com/uncoolzero">An @uncoolzero Enterprises product</a>
      </div>
    </div>
  )
}

export default App
