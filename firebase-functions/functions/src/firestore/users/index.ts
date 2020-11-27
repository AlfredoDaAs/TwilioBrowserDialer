import AbstractCollection from '../../firebase/AbstractCollection'
import * as admin from "firebase-admin"
// import { throwUntrustedClientError } from '../../common/FriendlyError'

const collectionName = 'users'

class Collection extends AbstractCollection {
    public defaultValues: any = {
        uid: null,
        name: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        picture: null,
        isAdmin: false,
        departments: []
    }

    public async findByEmail (email: String): Promise<any> {
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

    public async removeUsersDepartment (department: String): Promise<any> {
      const result = (await this.collection.where('departments', 'array-contains', department).get()).docs
      const batch = this.firestore.batch()

      result.forEach((doc: any) => {
        const data = doc.data()
        batch.update(this.collection.doc(data.id), {
          departments: admin.firestore.FieldValue.arrayRemove(department)
        })
      });

      return await batch.commit()
    }
}

export default new Collection(collectionName)