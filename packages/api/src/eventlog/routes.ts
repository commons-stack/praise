import { Router } from '@awaitjs/express';
import * as controller from './controllers';

// Period-routes
const eventLogRouter = Router();

eventLogRouter.getAsync('/all', controller.all);
eventLogRouter.getAsync('/types', controller.types);

export { eventLogRouter };
