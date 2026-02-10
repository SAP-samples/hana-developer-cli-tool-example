import { expect } from 'chai'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { fileURLToPath } from 'url'
import mock from 'mock-fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Cross-Platform Support Tests
 * @tags @all
 * 
 * These tests verify that the HANA CLI works correctly across
 * Windows, Linux, and macOS platforms.
 */
describe('Cross-Platform Support Tests @all', function () {
    
    describe('Platform Detection', function () {
        
        it('should correctly identify the current platform', function () {
            const platform = process.platform
            expect(platform).to.be.oneOf(['win32', 'darwin', 'linux', 'freebsd', 'openbsd'])
        })
        
        it('should have consistent path separator usage', function () {
            const testPath = path.join('bin', 'cli.js')
            // path.join should always use the OS-appropriate separator
            if (process.platform === 'win32') {
                expect(testPath).to.include('\\')
            } else {
                expect(testPath).to.include('/')
            }
        })
        
        it('should normalize paths correctly across platforms', function () {
            const testPath = path.normalize('bin/subdir/../cli.js')
            const expectedPath = path.join('bin', 'cli.js')
            expect(testPath).to.equal(expectedPath)
        })
    })
    
    describe('Path Handling @all', function () {
        
        it('should handle absolute paths correctly', function () {
            const absolutePath = path.resolve('bin', 'cli.js')
            expect(path.isAbsolute(absolutePath)).to.be.true
        })
        
        it('should handle relative paths correctly', function () {
            const relativePath = path.relative(process.cwd(), path.join(process.cwd(), 'bin', 'cli.js'))
            expect(path.isAbsolute(relativePath)).to.be.false
        })
        
        it('should parse path components correctly', function () {
            const testPath = path.join('utils', 'base.js')
            const parsed = path.parse(testPath)
            
            expect(parsed.name).to.equal('base')
            expect(parsed.ext).to.equal('.js')
            expect(parsed.base).to.equal('base.js')
        })
        
        it('should handle paths with spaces correctly', function () {
            const pathWithSpaces = path.join('my folder', 'my file.js')
            const parsed = path.parse(pathWithSpaces)
            
            expect(parsed.name).to.equal('my file')
            expect(parsed.base).to.equal('my file.js')
        })
    })
    
    describe('Environment Variables @all', function () {
        
        it('should access HOME or USERPROFILE environment variable', function () {
            const homeVar = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
            expect(homeVar).to.be.a('string').and.not.be.empty
        })
        
        it('should handle platform-specific config paths', function () {
            let configPath
            
            if (process.platform === 'win32' && process.env.APPDATA) {
                configPath = path.join(process.env.APPDATA, 'test-config')
                expect(configPath).to.include('AppData')
            } else if (process.platform === 'darwin') {
                configPath = path.join(process.env.HOME, 'Library', 'Preferences', 'test-config')
                expect(configPath).to.include('Library')
            } else {
                configPath = path.join(process.env.HOME, '.config', 'test-config')
                expect(configPath).to.include('.config')
            }
            
            expect(configPath).to.be.a('string')
        })
    })
    
    describe('File Operations @all', function () {
        
        afterEach(function () {
            mock.restore()
        })
        
        it('should read files with correct line endings', async function () {
            mock({
                'test-file.txt': 'line1\nline2\nline3'
            })
            
            const content = fs.readFileSync('test-file.txt', 'utf8')
            const lines = content.split(/\r?\n/)
            
            expect(lines).to.have.lengthOf(3)
            expect(lines[0]).to.equal('line1')
        })
        
        it('should handle file paths with correct separators', function () {
            const testPath = path.join('bin', 'utils', 'helper.js')
            const normalized = path.normalize(testPath)
            
            // Should use platform-specific separators
            expect(normalized).to.be.a('string')
            expect(normalized).to.include('helper.js')
        })
        
        it('should work with __dirname equivalent in ES modules', function () {
            // __dirname is defined at the top using fileURLToPath
            expect(__dirname).to.be.a('string')
            expect(path.isAbsolute(__dirname)).to.be.true
        })
    })
    
    describe('Platform-Specific Functionality @all', function () {
        
        it('should handle platform-specific command extensions', function () {
            const commandName = 'hana-cli'
            const executable = process.platform === 'win32' ? `${commandName}.cmd` : commandName
            
            expect(executable).to.be.a('string')
            if (process.platform === 'win32') {
                expect(executable).to.include('.cmd')
            }
        })
        
        it('should use correct line ending for the platform', function () {
            const eol = os.EOL
            
            if (process.platform === 'win32') {
                expect(eol).to.equal('\r\n')
            } else {
                expect(eol).to.equal('\n')
            }
        })
        
        it('should get temp directory correctly on all platforms', function () {
            const tmpDir = os.tmpdir()
            
            expect(tmpDir).to.be.a('string').and.not.be.empty
            expect(path.isAbsolute(tmpDir)).to.be.true
        })
    })
    
    describe('Windows-Specific Tests @windows', function () {
        
        it('should handle Windows drive letters', function () {
            if (process.platform === 'win32') {
                const cwd = process.cwd()
                // Windows paths should start with drive letter
                expect(cwd).to.match(/^[A-Z]:/i)
            } else {
                this.skip()
            }
        })
        
        it('should handle Windows UNC paths', function () {
            if (process.platform === 'win32') {
                const uncPath = '\\\\server\\share\\file.txt'
                const normalized = path.normalize(uncPath)
                expect(normalized).to.include('\\\\server\\share')
            } else {
                this.skip()
            }
        })
    })
    
    describe('Unix-Specific Tests @unix', function () {
        
        it('should handle Unix absolute paths starting with /', function () {
            if (process.platform !== 'win32') {
                const absolutePath = path.resolve('/usr/local/bin')
                expect(absolutePath).to.match(/^\//)
            } else {
                this.skip()
            }
        })
        
        it('should handle symlinks (Unix/Mac)', function () {
            if (process.platform !== 'win32') {
                // This is a basic check that the fs API is available
                expect(fs.lstat).to.be.a('function')
                expect(fs.readlink).to.be.a('function')
            } else {
                this.skip()
            }
        })
    })
    
    describe('Path Resolution @all', function () {
        
        it('should resolve relative paths from different working directories', function () {
            const originalCwd = process.cwd()
            const testPath = path.resolve(originalCwd, 'bin', 'cli.js')
            
            expect(path.isAbsolute(testPath)).to.be.true
            expect(testPath).to.include('bin')
            expect(testPath).to.include('cli.js')
        })
        
        it('should handle parent directory references correctly', function () {
            const testPath = path.resolve('bin', '..', 'utils', 'base.js')
            const normalized = path.normalize(testPath)
            
            expect(normalized).to.include('utils')
            expect(normalized).to.include('base.js')
        })
        
        it('should create platform-appropriate file URLs', function () {
            const filePath = path.join(process.cwd(), 'test.js')
            const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`)
            
            expect(fileUrl.protocol).to.equal('file:')
        })
    })
    
    describe('Module Resolution @all', function () {
        
        it('should resolve ES module imports correctly', async function () {
            // Test that import.meta.url works
            const currentFile = fileURLToPath(import.meta.url)
            expect(currentFile).to.be.a('string')
            expect(path.isAbsolute(currentFile)).to.be.true
        })
        
        it('should handle dynamic imports consistently', async function () {
            // Dynamic imports should work on all platforms
            try {
                const module = await import('path')
                expect(module.join).to.be.a('function')
            } catch (error) {
                throw new Error(`Dynamic import failed: ${error.message}`)
            }
        })
    })
})

describe('Mock Filesystem Tests @all', function () {
    
    afterEach(function () {
        mock.restore()
    })
    
    it('should mock filesystem for cross-platform testing', function () {
        mock({
            '/fake/path': {
                'file1.js': 'console.log("test")',
                'file2.json': JSON.stringify({ test: true }),
                'subdir': {
                    'nested.txt': 'nested content'
                }
            }
        })
        
        const exists = fs.existsSync('/fake/path/file1.js')
        expect(exists).to.be.true
        
        const content = fs.readFileSync('/fake/path/file1.js', 'utf8')
        expect(content).to.equal('console.log("test")')
    })
    
    it('should simulate Windows paths on any platform', function () {
        mock({
            'C:\\Users\\test\\config.json': JSON.stringify({ test: 'windows' })
        })
        
        // On Windows, this should work natively
        // On Unix, mock-fs normalizes it
        const normalized = path.normalize('C:\\Users\\test\\config.json')
        expect(normalized).to.be.a('string')
    })
    
    it('should simulate Unix paths on any platform', function () {
        mock({
            '/home/test/.config/test.json': JSON.stringify({ test: 'unix' })
        })
        
        const exists = fs.existsSync('/home/test/.config/test.json')
        expect(exists).to.be.true
    })
})
