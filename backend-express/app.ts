import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as morgan from 'morgan';
import { MainRouter } from 'routes/main-router';
import * as cors from 'cors';

declare global {
    namespace Express {
        interface Request {
            text: String
        }
    }
}

/**
 * The main application file, where we configure all middleware (in config())
 * and all routing (through the MainRouter class) in that order.
 */
class App {
    public app: express.Application;

    constructor() {
        this.app = express();

        // Configure middleware
        this.config();

        // Configure routes
        (new MainRouter()).attach(this.app);
    }

    private config(): void {
        // We configure CORS to allow all origins/requests. Do NOT use such
        // a configuration for a real production app!
        this.app.use(cors())

        // We log all incoming requests
        this.app.use(morgan('combined'));
        
        // Parse body depending on type
        this.app.use(bodyParser.text({ type: 'text/csv' }));
        this.app.use(bodyParser.json({ type: 'application/json' }));
        
        // Handle bad requests
        this.app.use(function (error, req, res, next) {
            if (error instanceof SyntaxError) {
                res.sendStatus(400);
                return;
            };
            next();
        });
    }
}

export default new App().app;