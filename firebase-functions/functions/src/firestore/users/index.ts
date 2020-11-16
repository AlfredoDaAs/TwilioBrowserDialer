import AbstractCollection from '../../firebase/AbstractCollection'
// import { throwUntrustedClientError } from '../../common/FriendlyError'

const collectionName = 'users'

class Collection extends AbstractCollection {
    public defaultValues: any = {
        uid: null,
        name: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        deparment: null,
        picture: null,
        isAdmin: false
    }

    public async findByEmail (email:string): Promise<any> {
        const result = (await this.collection.where('email', '==', email).get()).docs

        if(result.length === 0) {
            return null;
        }
        
        return result[0].data()
    }

    public async getAllUsers (): Promise<any[]> {
        const result = (await this.collection.get()).docs

        return result.map((doc:any) => doc.data())
    }
}

export default new Collection(collectionName)