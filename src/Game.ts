/* 
 * Sandbox Game
 * 
 * Copyright (c) 2021 opticfluorine
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. 
*/

import { container, singleton } from "tsyringe";

import { DisplayManager } from "./Display/DisplayManager";
import { GameStateManager } from "./GameState/GameStateManager";
import { InputManager } from "./Input/InputManager";

/**
 * Main class for the game. Root of the dependency graph.
 */
@singleton()
export class Game {
    public constructor(
        displayManager : DisplayManager,
        gameStateManager : GameStateManager,
        inputManager : InputManager) 
    {
        this.displayManager = displayManager;
        this.gameStateManager = gameStateManager;
        this.inputManager = inputManager;
    }

    /** Starts the game. */
    public start() {
        // Initialize.
        try {
            this.displayManager.initialize();
        } catch (e) {
            console.error(e);
        }

        // Start the main loop.
        this.doMainLoop();
    }

    /** Starts the main loop. */
    private doMainLoop() {

        // Execute the main loop.
        const game = this;
        function main() {
            // Schedule next frame entry.
            window.requestAnimationFrame(main);

            try {
                // Accept inputs.
                game.inputManager.doInputProcessing();

                // Advance game state by one frame.
                game.gameStateManager.doUpdateGameState();

                // Send outputs (rendering, audio, etc).
                game.displayManager.doRender();

            } catch (e) {
                console.error(e);
            }
        }
        main();
    }

    /** Display manager. */
    private displayManager : DisplayManager;

    /** Game state manager. */
    private gameStateManager : GameStateManager;

    /** Input manager. */
    private inputManager : InputManager;

}

container.register<Game>(Game, {useClass: Game});
