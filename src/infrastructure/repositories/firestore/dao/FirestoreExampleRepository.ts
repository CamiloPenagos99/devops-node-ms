import { injectable } from 'inversify';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { Firestore } from '@google-cloud/firestore';
import { ExampleRepository } from '@domain/repository';
import { ExampleEntity } from '@domain/entities';
import { FirestoreException } from '@domain/exceptions';
@injectable()
export class FirestoreExampleRepository implements ExampleRepository {
    private firestore = DEPENDENCY_CONTAINER.get<Firestore>(TYPES.Firestore);
    private collection = 'testing';

    async save(model: ExampleEntity): Promise<void> {
        try {
            await this.firestore.collection(this.collection).add({ ...model });
        } catch ({ code, message }) {
            throw new FirestoreException(code as number | string | undefined, message as string);
        }
    }
}
