import AbstractCollection from '../../firebase/AbstractCollection'

const collectionName = 'departments'

class Collection extends AbstractCollection {
  public defaultValues: any = {
    name: null,
    taskQueueSid: null,
  }

  public async getDeparments(): Promise<any[]> {
    const result = (await this.collection.get()).docs

    return result.map((doc:any) => doc.data())
  }
}

export default new Collection(collectionName)