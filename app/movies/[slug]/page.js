export default async function Series ({ params }) {

  const {slug} = await params
  
  return(
    <h1>{slug}</h1>
  )
}