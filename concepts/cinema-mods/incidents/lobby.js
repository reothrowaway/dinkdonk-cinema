import {arcade} from './arcade.js';
import {frontOfHouse} from './front-of-house.js';
import {paperStage} from './paper-stage.js';
import {sidewalk} from './sidewalk.js';

export const lobbyIncidents={...arcade,...frontOfHouse,...paperStage,...sidewalk};
