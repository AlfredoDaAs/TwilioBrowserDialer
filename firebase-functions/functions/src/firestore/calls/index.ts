import AbstractCollection from '../../firebase/AbstractCollection'

const collectionName = 'calls'

class Collection extends AbstractCollection {
  public defaultValues: any = {
    from: null,
    to: null
  }

  public async getCallsOfNumber(number: string): Promise<any[]> {
    const results = (await this.collection.where('from', '==', number).where('to', '==', number).get()).docs

    return results.map((doc:any) => doc.data())
  }
}

export default new Collection(collectionName)