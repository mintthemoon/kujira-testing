const { CosmWasmClient } = require('@cosmjs/cosmwasm-stargate')
const { Tendermint34Client } = require('@cosmjs/tendermint-rpc')
const { ProposalStatus } = require('cosmjs-types/cosmos/gov/v1beta1/gov')
const axios = require('axios')
const expect = require('chai').expect
const k = require('kujira')

describe('rpc test suite', function() {
    var rpcHeights = {} 
    var minHeight = 0
    it('get block heights', () => {
        const heightsRes = k.RPCS['kaiyo-1'].map(rpc =>
            axios({method: 'get', url: `${rpc}/block`, timeout: 1500}).then(res => {
                expect(res.status).to.eq(200)
                expect(res.data).to.have.property('result')
                expect(res.data.result).to.have.property('block')
                expect(res.data.result.block).to.have.property('header')
                expect(res.data.result.block.header).to.have.property('height')
                const height = Number(res.data.result.block.header.height)
                expect(height).to.be.at.least(1)
                expect(height % 1).to.eq(0)
                rpcHeights[rpc] = height
            })
        )
        return Promise.all(heightsRes).then(() => {
            const heights = Object.values(rpcHeights)
            expect(heights).is.not.empty
            const maxHeight = Math.max(...heights)
            minHeight = maxHeight - 3
        })
    })
    k.RPCS['kaiyo-1'].map(rpc => {
        describe(rpc, function() {
            it(`height`, () => {
                expect(rpcHeights).to.have.property(rpc)
                expect(rpcHeights[rpc]).to.be.at.least(minHeight)
            })
            it('health', () => fetch(`${rpc}/health`).then(res => {
                expect(res.status).to.eq(200)
            }))
            it(`axlUSDC/USK book`, () => {
                market_addr = 'kujira1rwx6w02alc4kaz7xpyg3rlxpjl4g63x5jq292mkxgg65zqpn5llq202vh5'
                market = CosmWasmClient.connect(rpc).then(client => new k.fin.FinQueryClient(client, market_addr))
                return market.then(m => m.book({}).then(book => {
                    expect(book).to.have.property('base')
                    expect(book).to.have.property('quote')
                }))
            })
            it(`KUJI/axlUSDC book`, () => {
                market_addr = 'kujira14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sl4e867'
                market = CosmWasmClient.connect(rpc).then(client => new k.fin.FinQueryClient(client, market_addr))
                return market.then(m => m.book({}).then(book => {
                    expect(book).to.have.property('base')
                    expect(book).to.have.property('quote')
                }))
            })
            it(`gov proposals`, () => Tendermint34Client.connect(rpc)
                .then(client => k.kujiraQueryClient({client}))
                .then(kujira => kujira.gov.proposals(ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED, "", "", {
                    key: new Uint8Array(),
                    offset: 0,
                    limit: 5,
                    countTotal: true,
                    reverse: true
                }))
                .then(res => {
                    expect(res).to.have.property('proposals')
                    expect(res.proposals).to.have.lengthOf(5)
                })
            )
        })
    })
})
