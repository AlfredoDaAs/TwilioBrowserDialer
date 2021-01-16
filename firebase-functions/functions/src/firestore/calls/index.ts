import AbstractCollection from '../../firebase/AbstractCollection'

const collectionName = 'calls'

class Collection extends AbstractCollection {
  public defaultValues: any = {
    from: null,
    to: null,
    direction: 'inbound' || 'outbound',
    transfers: [],
    conferenceSid: null,
    callSid: null,
    callDuration: null
  }

  public async getCallsOfNumber(number: string): Promise<any[]> {
    const from = (await this.collection.where('from', '==', number).get()).docs.map((doc:any) => doc.data())
    const to = (await this.collection.where('to', '==', number).get()).docs.map((doc:any) => doc.data())

    const results = from.concat(to)

    results.sort((a:any,b:any)=> {
        return (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime())
    })

    return results
  }

  public async getCalls(): Promise<any[]> {
    const results = (await this.collection.limit(20).orderBy('createdAt', 'desc').get()).docs

    return results.map((doc:any) => doc.data())
  }

  public async getCallBySid(sid: string): Promise<any> {
    const result = (await this.collection.where('callSid', '==', sid).get()).docs

    if(result.length === 0) {
        return null;
    }

    return result[0].data()
  }
}

export default new Collection(collectionName)