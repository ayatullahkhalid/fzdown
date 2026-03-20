import Scraper from '@/lib/scraper'
import React from 'react'

const Home = async () => {
  const scraper = new Scraper()
  
  //const seasonData = await scraper.getEpisodes(await scraper.getEpisodeList("files-One_Piece--2830.htm"), scraper.baseSeriesURL)

  return (
    <div>
<pre className="bg-black text-green-400 p-3 rounded max-h-96 overflow-auto text-xs">
  {
  //JSON.stringify(seasonData, null, 2)
  }
</pre>
    </div>
  )
}

export default Home