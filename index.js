const fs = require('fs')
const request = require('request')
const Uni = require('./src/server/models/uni.js')
const mongoose = require('mongoose')
const config = require('./src/server/config/database')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const express = require('express')

const app = express()
app.get('', (req,res) => {
    Uni.find({}).catch(err => {})
    .then(unis => res.json(unis))
})
app.listen(process.env.PORT, () => console.log('Heroku listens on port ' + process.env.PORT))

mongoose.Promise = Promise


mongoose.connect(config.database)
mongoose.connection.once('open', () => {
    console.log(`
        Connected to database ${config.database},
        secret: ${config.secret}
    `)
    start()

    mongoose.connection.on('error', (err) => {
        console.log(`
            Can't connect to database
            error: 
            ${err}
        `)
    })
})



function start(){
    Uni.find({})
    .catch(err => {})
    .then(universities => {

        const compressed = parseInt(fs.readFileSync('./public/compressed.txt'))
        fs.writeFile('./public/compressed.txt', compressed-1, err => {})
        universities = universities.slice(compressed > 0 ? compressed-1 : compressed, universities.length)
        console.log('Universities remaining: ', universities.length, ' : ', compressed)

        let count = 0
        
        function takeTenUniversities(){

            const howMuch = 2
            if(count >= universities.length)return 'done'

            let successUniversities = 0
            universities.slice(count, count + howMuch).forEach(university => {
                
                
                const name = university.name
                const images = university.images.slice(0, 15)
                let ext = ''
                let valid = 15
                let successImages = 0
                let tOut

                function timeOutSetter(){
                    const tt = setTimeout(() => {
                        valid--;
                        console.log('Timer\'s out : ' + successImages + ' / ' + valid)
                        if(successImages == valid){
                            successUniversities++
                            console.log('Success Unis: ', successUniversities)
                            fs.writeFile('./public/compressed.txt', parseInt(fs.readFileSync('./public/compressed.txt')) + 1, () => {})
                        }

                        if(successUniversities == howMuch){
                            successUniversities = 0
                            fs.readdir('./compressing', (err, files) => {
                                let j = 0
                                console.log(files)
                                files.forEach(file => {
                                    imagemin(['./compressing/' + file], './public/images', {
                                        use: [
                                            imageminWebp({quality: 75})
                                        ]
                                    }).catch(err => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    }).then(() => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    })
                                })
                                
                            })
                        }

                    }, 90000)
                    return tt
                }
                
                
                images.forEach((url, i) => {

                    request.get(url).on('error', err => {
                        clearTimeout(tOut)
                        tOut = timeOutSetter()
                        valid--;
                        console.log('Fuck\'n shit')
                        if(successImages == valid){
                            successUniversities++
                            console.log('Success Unis: ', successUniversities)
                            fs.writeFile('./public/compressed.txt', parseInt(fs.readFileSync('./public/compressed.txt')) + 1, () => {})
                        }

                        if(successUniversities == howMuch){
                            successUniversities = 0
                            fs.readdir('./compressing', (err, files) => {
                                let j = 0
                                console.log(files)
                                files.forEach(file => {
                                    imagemin(['./compressing/' + file], './public/images', {
                                        use: [
                                            imageminWebp({quality: 75})
                                        ]
                                    }).catch(err => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    }).then(() => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    })
                                })
                                
                            })
                        }
                    }).on('response', res => {
                        switch(res.toJSON().headers['content-type']){
                            case 'image/jpeg': ext = '.jpg'; break
                            case 'image/gif': ext = '.gif'; break
                            case 'image/pjpeg': ext = '.jpg'; break
                            case 'image/png': ext = '.png'; break
                            case 'image/svg+xml': ext = '.svg'; break
                            case 'image/tiff': ext = 'tiff'; break
                            case 'image/vnd.microsoft.icon': ext = 'ico'; break
                            case 'image/vnd.wap.wbmp': ext = '.wbmp'; break
                            case 'image/webp': ext = '.webp'; break
                            default: ext = 'none'; console.log(res.toJSON().headers['content-type']); break
                        }
                        if(ext === 'none'){
                            clearTimeout(tOut)
                            tOut = timeOutSetter()
                            if(successImages == valid){
                                successUniversities++
                                console.log('Success Unis: ', successUniversities)
                                fs.writeFile('./public/compressed.txt', parseInt(fs.readFileSync('./public/compressed.txt')) + 1, () => {})
                            }

                            if(successUniversities == howMuch){
                                successUniversities = 0
                                fs.readdir('./compressing', (err, files) => {
                                    let j = 0
                                    console.log(files)
                                    files.forEach(file => {
                                        imagemin(['./compressing/' + file], './public/images', {
                                            use: [
                                                imageminWebp({quality: 75})
                                            ]
                                        }).catch(err => {
                                            fs.unlink('./compressing/' + file, () => {
                                                j++
                                                if(j == files.length){
                                                    count += howMuch
                                                    console.log('+++  ' + count + '  +++')
                                                    return takeTenUniversities()
                                                }
                                            })
                                        }).then(() => {
                                            fs.unlink('./compressing/' + file, () => {
                                                j++
                                                if(j == files.length){
                                                    count += howMuch
                                                    console.log('+++  ' + count + '  +++')
                                                    return takeTenUniversities()
                                                }
                                            })
                                        })
                                    })
                                    
                                })
                            }
                        }
                    }).pipe(ext != 'none' ? fs.createWriteStream('compressing/' + name + '-' + i + ext)
                    .on('error', err => {console.log('Pipe Error')})//TODO:  add logics
                    .on('close', () => {
                        clearTimeout(tOut)
                        tOut = timeOutSetter()
                        successImages++
                        console.log('+', successImages + ' / ' + valid)
                        if(successImages == valid){
                            successUniversities++
                            console.log('Success Unis: ', successUniversities)
                            fs.writeFile('./public/compressed.txt', parseInt(fs.readFileSync('./public/compressed.txt')) + 1, () => {})
                        }
                            
                            
                        if(successUniversities == howMuch){
                            successUniversities = 0
                            fs.readdir('./compressing', (err, files) => {
                                let j = 0
                                console.log(files)
                                files.forEach(file => {
                                    imagemin(['./compressing/' + file], './public/images', {
                                        use: [
                                            imageminWebp({quality: 75})
                                        ]
                                    }).catch(err => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    }).then(() => {
                                        fs.unlink('./compressing/' + file, () => {
                                            j++
                                            if(j == files.length){
                                                count += howMuch
                                                console.log('+++  ' + count + '  +++')
                                                return takeTenUniversities()
                                            }
                                        })
                                    })
                                })
                                
                            })
                        }
                    }) : null)
                })

            })
        }

        takeTenUniversities()
    })
}

