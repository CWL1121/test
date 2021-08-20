const axios = require('axios')
const cheerio  = require('cheerio')
const basic_url = "https://nhentai.net/?page="
const search_url="https://nhentai.net/search/?q="
const reader_url="https://nhentai.net/g/"

async function get(url){
    const nList = []
    await axios(url).then(res=>{
        let $ = cheerio.load(res.data)
        $('div .gallery').each((index,n)=>{
            let data ={
                title:n.childNodes[0].children[2].children[0].data,
                href:"https://nhentai.net"+n.childNodes[0].attribs.href,
                img:"https://nhentai.net/g/"+(n.childNodes[0].attribs.href).split('/')[2]+"/1/",
                thumbs :{width:n.childNodes[0].children[0].attribs.width,height:n.childNodes[0].children[0].attribs.height,url:n.childNodes[0].children[0].attribs['data-src']},
            }
            nList.push(data)
        })
    })
    return nList
}

async function getter(page,keywords){
    let data = []
    for (let index = 1; index <= page; index++) {
        if (keywords) {
            url = search_url+keywords+"&page="+index
        }else{
            url = basic_url+index 
        }
        let info = await get(url)
        data.push(info)       
    }
    return data
}

async function reader(tag){
    let url = reader_url+tag+"/",data={},title,tags,tagsinfo=[],nList=[]
    await axios(url).then(res=>{
        const $ = cheerio.load(res.data)
        title = $('div #info').children()['1']
        title = cheerio.load(title)
        title = (title.text());

        $('div .thumb-container').each((index,n)=>{
            nList.push("https://nhentai.net"+n.children[0].attribs.href)
        })

        tags = $('div #info').children()['2']
        tags = cheerio.load(tags)
        tags('div').each((i,n)=>{
            let tagsTitle = n.children[0].data
            tagsTitle = tagsTitle.replace(/\t/g,"")
            tagsTitle = tagsTitle.replace(/\n/g,"")
            tagsTitle = tagsTitle.replace(":","")

            tags = n.children[1]
            tags = cheerio.load(tags)
            let ta = []
            tags('a').each((i,n)=>{
                if(n.children[1]){
                    let t = n.children[0].children[0].data
                    ta.push(t)
                }else{
                    ta.push(n.children[0].children[0].data)
                }
            })
            tags('time').each((i,n)=>{
                ta.push(n.children[0].data)
            })
            let info = {
                title:tagsTitle,
                tags:ta
            }
            tagsinfo.push(info)
        })
    })
    data={title,pages:nList,tags:tagsinfo}
    return data
}


module.exports = {
    getter,reader
}

