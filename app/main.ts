import * as fs from 'fs';
import zlib from 'zlib';
import crpyto from "crypto";

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = "init",
    Catfile = "cat-file",
    HashObject = "hash-object"
}

// Flags and FilePaths are stored here
const getFlags = () => args[1].slice(1).split("");
const getFilePath = () => args[2]

switch (command) { 
    case Commands.Init:
        // You can use print statements as follows for debugging, they'll be visible when running tests.
        console.log("Logs from your program will appear here!");

        // Uncomment this block to pass the first stage
        fs.mkdirSync(".git", { recursive: true });
        fs.mkdirSync(".git/objects", { recursive: true });
        fs.mkdirSync(".git/refs", { recursive: true });
        fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
        console.log("Initialized git directory");
        break;
    case Commands.Catfile:
        if (getFlags().includes("p")){
            const file = fs.readFileSync(`.git/objects/${args[2].slice(0, 2)}/${args[2].slice(2)}`);
            const blob = zlib.unzipSync(file).toString().split('\0')[1];
            process.stdout.write(blob)
        }
        break;
    case Commands.HashObject:
        const data = fs.readFileSync(getFilePath());
        const metaData = Buffer.from(`blob ${data.length}\0`);
        const contents = Buffer.concat([metaData, data]);
        // Buffers are in binary format by default (<Buffer 34 52 6c 5f 00 00>) You can read them:
        // console.log(data.toString('utf8')) 
        // Hash it! (SHA-1)
        const hash = crypto.createHash("sha1").update(contents).digest("hex");
        process.stdout.write(hash);
        // If we have a '-w' flag, write it to the objects directory
        if (getFlags().includes("w")) {
            const compressedData = zlib.deflateSync(contents);
            const objectPath = `.git/objects/${hash.slice(0, 2)}/${hash.slice(2)}`;
            fs.mkdirSync(`.git/objects/${hash.slice(0, 2)}`, { recursive: true });
            fs.writeFileSync(objectPath, compressedData);
        }
        break;
    default:
        throw new Error(`Unknown command ${command}`);
}
