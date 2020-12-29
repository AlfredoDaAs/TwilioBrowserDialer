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
    callTime: null
  }

  public async getCallsOfNumber(number: string): Promise<any[]> {
    const results = (await this.collection.where('from', '==', number).where('to', '==', number).get()).docs

    return results.map((doc:any) => doc.data())
  }

  public async getCalls(): Promise<any[]> {
    const results = (await this.collection.limit(20).orderBy('createdAt', 'desc').get()).docs

    return results.map((doc:any) => doc.data())
  }
}

export default new Collection(collectionName)