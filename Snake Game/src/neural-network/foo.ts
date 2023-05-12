// const initRandom = (rowIndex: number, colIndex: number) => Math.random() //- 0.5
// const initRandom = (rowIndex: number, colIndex: number) => {
//     const stdDev = 1 / Math.sqrt(colIndex +1)
//     const h = Math.random() * stdDev * 2 - stdDev
//     return h
// }
import {INeuralNetwork, NeuralNetworkReLu} from './fooReLu'

const a = Math.sqrt(6 / (2 + 2));
const initRandom = (rowIndex: number, colIndex: number) => Math.random() * (a + a) -a;


export class NeuralNetwork implements INeuralNetwork{
    private  weights: number[][][]
    private  biases: number[][][]

    copy():NeuralNetwork{
        const nn = new NeuralNetwork(this.inputLayerSize,this.hiddenLayerSizes,this.outputLayerSize)
        nn.weights =this.weights
        nn.biases =this.biases
        return nn
    }

    from(
        inputLayerSize: number,
        hiddenLayerSizes: number[],
        outputLayerSize: number,
        weights: number[][][],
        biases: number[][][]
    ): INeuralNetwork {
        const n = new NeuralNetwork(inputLayerSize, hiddenLayerSizes, outputLayerSize)
        n.weights = weights
        n.biases = biases
        return n
    }

    toConfig(): {
        inputLayerSize: number,
        hiddenLayerSizes: number[],
        outputLayerSize: number,
        weights: number[][][],
        biases: number[][][]
    } {
        return {
            inputLayerSize: this.inputLayerSize,
            hiddenLayerSizes: this.hiddenLayerSizes,
            outputLayerSize: this.outputLayerSize,
            weights: this.weights,
            biases: this.biases
        }
    }

    constructor(private readonly inputLayerSize: number, private readonly hiddenLayerSizes: number[], private readonly outputLayerSize: number) {
        // Initialize weights and biases
        this.weights = []
        this.biases = []

        // for (let i = 0; i < this.hiddenLayerSizes.length + 1; i++) {
        //     const numIn = i === 0 ? inputLayerSize : hiddenLayerSizes[i - 1]
        //     const numOut = i === hiddenLayerSizes.length ? outputLayerSize : hiddenLayerSizes[i]
        //     this.weights.push(this.initMatrix(numIn, numOut, initRandom))
        //     this.biases.push(this.initMatrix(1, numOut, initRandom))
        // }

        /// TODO XAVIER Initialization
        const sizes = [inputLayerSize, ...hiddenLayerSizes, outputLayerSize]
        // Initialize weights and biases for each layer
        for (let i = 1; i < sizes.length; i++) {
            const prevSize = sizes[i - 1];
            const currSize = sizes[i];

            const stdDev = Math.sqrt(1 / prevSize);
            const layerWeights = [];
            for (let k = 0; k < prevSize; k++) {
                const neuronWeights = [];
                for (let j = 0; j < currSize; j++) {
                    neuronWeights.push(Math.random() * stdDev * 2 - stdDev);
                }
                layerWeights.push(neuronWeights);
            }
            this.weights.push(layerWeights);

            const layerBiases = [];
            for (let j = 0; j < currSize; j++) {
                layerBiases.push(Math.random() * 2 - 1);
            }
            this.biases.push([layerBiases]);
        }
        // console.log(this.weights)
        // console.log(this.biases)

    }

    // Forward pass
    predict(inputs: number[]): number[] {
        let activations: number[][] = [inputs]
        for (let i = 0; i < this.hiddenLayerSizes.length + 1; i++) {
            const weights = this.weights[i]
            const biases = this.biases[i]
            const hidden = this.sigmoidMatrix(//1x3
                this.matrixAdd(//1x3
                    this.matrixMultiply( // 1 x 3
                        activations, // 1 x 4
                        weights // 4 x 3
                    ),
                    biases // 1 x 3
                )
            )
            activations = hidden
        }
        const [output] = activations
        return output
    }

    takeWeightsFrom(nn:NeuralNetwork){
        this.weights = nn.weights
        this.biases = nn.biases
    }

    // Train the network using backpropagation
    train(inputs: number[][], targets: number[][], learningRate: number) {
        if (inputs.length != targets.length)
            throw 'The numbers of input and output samples must be equal'

        const numberSamples = inputs.length

        const unactivated = [inputs]
        const activations = [inputs]
        for (let i = 0; i < this.hiddenLayerSizes.length + 1; i++) {
            const weights = this.weights[i]
            const biases = this.matrixMultiply(this.initMatrix(numberSamples, 1, () => 1), this.biases[i])
            const unactiv = this.matrixAdd(this.matrixMultiply(activations[i], weights), biases)
            unactivated.push(unactiv)
            const hidden = this.sigmoidMatrix(unactiv)
            activations.push(hidden)
        }

        // Compute output error
        const outputError = this.matrixSubtract(targets, activations[activations.length - 1]) // TODO: Andere Error function? EDit: Passt nahc meinen Berechnungne zu squared error
        const outputDelta = this.hadamardProduct(
            outputError,
            this.sigmoidDerivativeMatrix(
                // activations[activations.length - 1] Sollte falsch sein
                unactivated[unactivated.length - 1]
            )
        )

        const copyWeights: number[][][] = JSON.parse(JSON.stringify(this.weights)) //TODO !!!!!!!!!!!!!!!!
        const copyBiases: number[][][] = JSON.parse(JSON.stringify(this.biases)) //TODO !!!!!!!!!!!!!!!!

        // Update weights to outputLayer
        this.weights[this.weights.length - 1] = this.matrixAdd( // 2x1
            copyWeights[copyWeights.length - 1], // 2 x 1
            this.matrixScalarMultiply( // 2 x 1
                this.matrixMultiply( // 2 x 1
                    this.transpose(activations[activations.length - 2]), // 2 x n
                    outputDelta // n x 1
                ),
                learningRate
            )
        )
        this.biases[this.biases.length - 1] = this.matrixAdd( // 1 x1
            copyBiases[copyBiases.length - 1], // 1 x1
            this.matrixScalarMultiply( // 1x1
                this.matrixMultiply( // 1 x 1
                    this.initMatrix(1, numberSamples, () => 1), //1xn
                    outputDelta // n x 1
                ),
                learningRate
            )
        )

        // console.log('updated last wights:')
        // Backpropagate error
        let delta = outputDelta // n x 1 zu Beginn für outputDelta
        for (let i = this.hiddenLayerSizes.length - 1; i >= 0; i--) { // 1, 0
            delta = this.hadamardProduct(
                this.sigmoidDerivativeMatrix(
                    unactivated[i + 1]
                ),
                this.matrixMultiply(
                    delta,
                    this.transpose(copyWeights[i + 1])
                )
            )

            this.weights[i] = this.matrixAdd(
                copyWeights[i],
                this.matrixScalarMultiply(
                    this.matrixMultiply(
                        this.transpose(activations[i]),
                        delta
                    ),
                    learningRate
                )
            )


            // const hidden = activations[i]
            // const hiddenDelta = this.matrixMultiply(delta, this.transpose(weights))
            // delta = this.matrixMultiply(hiddenDelta, this.sigmoidDerivativeMatrix(hidden))
            //
            // // Update weights and biases
            // this.weights[i] = this.matrixAdd( // soll werden 2 x 1
            //     weights, // 2 x 1
            //     this.matrixScalarMultiply( // 2 x 2
            //         this.matrixMultiply( // 2 x 2
            //             this.transpose(hidden), // 2 x n
            //             delta  // n x 2
            //         ),
            //         learningRate
            //     )
            // )
            // this.biases[i] = this.matrixAdd(biases, this.matrixMultiply(delta, learningRate))
        }
    }

    sigmoidMatrix(matrix: number[][]): number[][] {
        return this.mapMatrix(matrix, this.sigmoid.bind(this))
    }

    sigmoidDerivativeMatrix(matrix: number[][]): number[][] {
        return this.mapMatrix(matrix, this.sigmoidDerivative.bind(this))
    }

    sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x))
    }

    sigmoidDerivative(x: number): number {
        const s = this.sigmoid(x)
        return s * (1 - s)
    }

    // Helper functions for matrix operations
    initMatrix(rows: number, cols: number, initialValueFor: (rowIndex: number, colIndex: number) => number) {
        return Array(rows).fill(undefined).map(
            (rowValue, rowIndex) => Array(cols).fill(undefined).map(
                (colValue, colIndex) => initialValueFor(rowIndex, colIndex)
            )
        )
    }

    matrixScalarMultiply(matrix: number[][], scalar: number): number[][] {
        return matrix.map(row => row.map(element => element * scalar))
    }


    mapMatrix(matrix: number[][], func: (value: number) => number): number[][] {
        return matrix.map((row) => row.map(func))
    }

    matrixAdd(a: number[][], b: number[][]): number[][] {
        return a.map((row, i) => row.map((val, j) => val + b[i][j]))
    }

    matrixSubtract(a: number[][], b: number[][]): number[][] {
        return a.map((row, i) => row.map((val, j) => val - b[i][j]))
    }

    matrixMultiply(a: number[][], b: number[][]): number[][] {
        return a.map((row) => {
            return Array(b[0].length).fill(undefined).map((_, j) => {
                return b.reduce((sum, _, k) => sum + row[k] * b[k][j], 0)
            })
        })
    }

    hadamardProduct(a: number[][], b: number[][]): number[][] {
        if (a.length !== b.length || a[0].length !== b[0].length) {
            throw new Error('Matrices must be of the same size')
        }

        return a.map((row, i) => {
            return row.map((element, j) => element * b[i][j])
        })
    }


    transpose(matrix: number[][]): number[][] {
        const rows = matrix.length
        const cols = matrix[0].length

        const result: number[][] = []
        for (let j = 0; j < cols; j++) {
            result[j] = []
            for (let i = 0; i < rows; i++) {
                result[j][i] = matrix[i][j]
            }
        }
        return result
    }
}

