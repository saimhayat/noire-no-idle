import { Link } from 'react-router-dom';
const HELP = [
  { term: 'Delivery in Pakistan', detail: 'Charges & delivery information', to: '/shipping', icon: '01' },
  { term: 'Find your fit', detail: 'Clothing, kids & footwear size guides', to: '/size-guide', icon: '02' },
  { term: 'Returns & exchanges', detail: 'Everything you need to know', to: '/returns', icon: '03' }
];
export default function Band() {
  return <section className="band" aria-label="Shopping help"><div className="band__inner wrap">
    {HELP.map((p) => <Link className="band__item" key={p.term} to={p.to}><span className="band__number" aria-hidden="true">{p.icon}</span><h2>{p.term}</h2><p>{p.detail} ↗</p></Link>)}
  </div></section>;
}
