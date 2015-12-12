/**
 * @module angie-migrations.model.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/12/2015
 */

import { Model } from                           '../util/decorators';

@Model
class AngieMigrations {
    constructor($Fields) {
        this.name = 'angie_migrations';
        this.protoFilename =
            `${__dirname}/../../proto/angie-migrations.proto`;

        this.uuid = new $Fields.CharField();
        this.filename = new $Fields.CharField();
        this.active = new $Fields.BooleanField();
    }
}