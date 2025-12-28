export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            DiviLauncher
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Solana Token Launchpad
          </p>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Launch your token on Solana with customizable features, dividend distribution, and automated reward systems.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-2">Easy Launch</h3>
              <p className="text-gray-400">Launch tokens quickly with our streamlined process</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-2">Reward System</h3>
              <p className="text-gray-400">Automated dividend distribution and rewards</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-gray-400">Built on Solana with security best practices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
