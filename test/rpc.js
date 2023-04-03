const { CosmWasmClient } = require('@cosmjs/cosmwasm-stargate')
const expect = require('chai').expect
const k = require('kujira')

describe('rpc health', () => k.RPCS['kaiyo-1'].map(
  rpc => it(`${rpc} health`, () => 
    fetch(`${rpc}/health`).then(res => {
      expect(res.status).to.eq(200)
    })
  )
))

describe('rpc order books', function() {
    k.RPCS['kaiyo-1'].map(rpc => {
        it(`${rpc} axlUSDC/USK book`, () => {
            market_addr = 'kujira1rwx6w02alc4kaz7xpyg3rlxpjl4g63x5jq292mkxgg65zqpn5llq202vh5'
            market = CosmWasmClient.connect(rpc).then(client => new k.fin.FinQueryClient(client, market_addr))
            return market.then(m => m.book({}).then(book => {
                expect(book).to.have.property('base')
                expect(book).to.have.property('quote')
            }))
        })
        it(`${rpc} KUJI/axlUSDC book`, () => {
            market_addr = 'kujira14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sl4e867'
            market = CosmWasmClient.connect(rpc).then(client => new k.fin.FinQueryClient(client, market_addr))
            return market.then(m => m.book({}).then(book => {
                expect(book).to.have.property('base')
                expect(book).to.have.property('quote')
            }))
        })
    })
})