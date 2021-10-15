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

/**
 * Describes the placement of a single texture in the
 * texture atlas.
 */
export interface TextureAtlasRecord {
    /** X coordinate of top left corner. */
    top_left_x: number;

    /** Y coordinate of top left corner. */
    top_left_y: number;

    /** Width of the image in pixels. */
    width: number;

    /** Height of the image in pixels. */
    height: number;
}

/**
 * Describes the set of placements of textures into the
 * texture atlas.
 */
export interface TextureAtlasPlan {
    /** Width of the atlas in pixels. */
    width: number;

    /** Height of the atlas in pixels. */
    height: number;

    /** 
     * Placement data for each texture. 
     * The order matches the array of images passed to
     * the atlas constructor.
     */
    records: TextureAtlasRecord[];
}

/**
 * Packs images into the texture atlas.
 */
export class TextureAtlas {

    /**
     * Creates a new texture atlas containing a set of images. 
     * @param gl GL context.
     * @param images Images to pack into the texture atlas.
     */
    public constructor(gl: WebGL2RenderingContext,
        images: HTMLImageElement[])
    {
        // Plan packing strategy.
        this._plan = this.planPacking(images);

        // Allocate a canvas to hold the atlas, then populate.
        let atlasCanvas = this.packCanvas(images);

        // Create a WebGL texture from the canvas contents.
        this._texture = this.createTexture(gl, atlasCanvas);
    }

    /** WebGL texture containing the texture atlas. */
    public get texture() {
        return this._texture;
    }

    /** Placement of images into the texture atlas. */
    public get plan() {
        return this._plan;
    }

    /**
     * Develops a strategy for packing the images into the
     * texture atlas.
     * @returns Strategy for packing the texture atlas.
     */
    private planPacking(
        images: HTMLImageElement[]
    ): TextureAtlasPlan {
        // Initialize an empty plan.
        let plan = {
            width: 0,
            height: 0,
            records: new Array<TextureAtlasRecord>()
        };

        // Nothing fancy for now, just pack the images
        // horizontally in the order in which they appear
        // in the list. Wrap to a new "line" whenever the
        // next image would overflow the maximum atlas
        // dimension.
        let current_x = 0;
        let current_row_height = 0;
        for (let image of images) {
            // Select position, validate that the texture fits within bounds.
            if (image.width > TextureAtlas.MAX_DIMENSION) {
                throw new Error("Maximum texture atlas width exceeded.");
            }

            if (current_x + image.width > TextureAtlas.MAX_DIMENSION) {
                // Would wrap end of texture, advance to next row.
                current_x = 0;
                plan.height += current_row_height;
                current_row_height = 0;
            }

            if (plan.height + image.height > TextureAtlas.MAX_DIMENSION) {
                throw new Error("Maximum texture atlas height exceeded.");
            }

            // Insert new image at the current position.
            let record: TextureAtlasRecord = {
                top_left_x: current_x,
                top_left_y: plan.height,
                width: image.width,
                height: image.height
            };
            plan.records.push(record);
            
            // Advance current position without wrapping.
            current_x += image.width;
            if (current_x > plan.width) {
                plan.width = current_x;
            }
            if (image.height > current_row_height) {
                current_row_height = image.height;
            }
        }

        return plan;
    }

    /**
     * Packs the images into the texture atlas.
     * @return Canvas containing the texture atlas.
     */
    private packCanvas(
        images: HTMLImageElement[]
    ): HTMLCanvasElement {
        // Create a new atlas and blank it to transparent.
        let atlasCanvas = document.createElement('canvas');
        atlasCanvas.width = this._plan.width;
        atlasCanvas.height = this._plan.height;

        let context = atlasCanvas.getContext('2d');
        if (context == null) {
            throw new Error("Failed to get canvas context.");
        }

        context.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

        // Pack the images according to the plan.
        for (let i = 0; i < images.length; ++i) {
            let image = images[i];
            let plan = this._plan.records[i];
            context.drawImage(image, plan.top_left_x, plan.top_left_y);
        }

        return atlasCanvas;
    }

    /**
     * Creates a WebGL texture from the packed canvas.
     * @param gl GL context.
     * @param atlasCanvas Canvas containing the atlas.
     * @return Texture containing the texture atlas.
     */
    private createTexture(gl: WebGL2RenderingContext,
        atlasCanvas: HTMLCanvasElement): WebGLTexture
    {
        let texture = gl.createTexture();
        if (texture == null) {
            throw new Error("Failed to create atlas texture.");
        }
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            atlasCanvas);

        return texture;
    }

    /** Maximum allowable texture atlas dimension. */
    private static readonly MAX_DIMENSION = 4096;

    /** Planned placement of all  */
    private _plan: TextureAtlasPlan;

    /** Texture containing the texture atlas. */
    private _texture: WebGLTexture;

}
