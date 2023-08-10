import fs from 'fs'
import path from 'path'
import { MIGRATION_DATA_OUTPUT_PATH, SUCCESS_FILE_PREFIX } from '../common/constants'
import { Either, Left, Right } from 'purify-ts'
import { MigrationData } from '../common/types/script.types'
import { create } from 'domain'



const findMigrationFile = (): Either<Error, string> => {
    const successFiles = 
        fs
            .readdirSync(MIGRATION_DATA_OUTPUT_PATH)
            .filter((file) => file.startsWith(SUCCESS_FILE_PREFIX))

    if (successFiles.length === 0)
        return Left(new Error(`No migration files found in ${MIGRATION_DATA_OUTPUT_PATH}`))

    return Right(successFiles[0])
}


const readMigrationFile = (fileName: string): Either<Error, MigrationData[]> => {
    try {
        const migrationFilePath = path.resolve(MIGRATION_DATA_OUTPUT_PATH, fileName)
        const migrationFileContents = fs.readFileSync(migrationFilePath, 'utf8')

        // NOTE: because there is low risk if this fails, we can assume this will conform to the type
        return Right(JSON.parse(migrationFileContents))
    } catch (err) {
        return Left(new Error(`Failed to read migration file: ${err}`))
    }
}


const createRedirectFile = (data: MigrationData[]): Either<Error, string> => {
    try {

        const columns = '"original_url","destination_url"'
        const rows = data.map(({urls}) => `"${urls.existing}","${urls.destination}"`)
        
        const fileContents = `${columns}\n${rows.join('\n')}`
        
        const redirectsFile = path.resolve(MIGRATION_DATA_OUTPUT_PATH, 'redirects.csv')
        fs.writeFileSync(redirectsFile, fileContents)

        return Right(redirectsFile)
    } catch (err) {
        return Left(new Error(`Failed to create redirects file: ${err}`))
    }
}

const createRedirectsScript = () => 
    findMigrationFile()
    .chain(readMigrationFile)
    .chain(createRedirectFile)
    .caseOf({
        Left: (err) => {
            console.error(err)
            process.exit(1)
        },
        Right: (file) => {
            console.log(`Created migration file: ${file}`)
            process.exit(0)
        }
    })

createRedirectsScript()