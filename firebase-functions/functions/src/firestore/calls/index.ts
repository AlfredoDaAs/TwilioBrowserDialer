import AbstractCollection from '../../firebase/AbstractCollection'

const collectionName = 'calls'

class Collection extends AbstractCollection {
  public defaultValues: any = {
    fromData: {
      from: null,
      city: null,
      country: null,
      state: null,
      zip: null
    },
    toData: {
      to: null,
      city: null,
      country: null,
      state: null,
      zip: null
    },
    direction: 'inbound' || 'outbound',
    transfers: [],
    callSid: null
  }

  public async getCallsOfNumber(number: string): Promise<any[]> {
    const results = (await this.collection.where('from', '==', number).where('to', '==', number).get()).docs

    return results.map((doc:any) => doc.data())
  }
}

export default new Collection(collectionName)