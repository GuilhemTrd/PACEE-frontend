import React from 'react';
import './Articles.css';
import Navbar from '../navbar/Navbar';

const Articles = () => {
    const articles = [
        {
            id: 1,
            title: "Les 8 meilleures chaussures de trail pour un ultra-trail",
            content: "Participer à un ultra-trail est une aventure épique. Vos chaussures jouent un rôle clé dans votre performance et votre confort. Découvrez les 8 meilleures chaussures adaptées aux terrains les plus exigeants ...",
            created_at: "2024-12-01",
            updated_at: "2024-12-02",
            status: true,
        },
        {
            id: 2,
            title: "Hydratation en trail : les 5 erreurs à éviter",
            content: "L'hydratation est un élément essentiel lors de vos sorties en trail. Mais attention, certaines erreurs peuvent ruiner votre performance. Voici les 5 pièges les plus courants et comment les éviter ...",
            created_at: "2024-12-03",
            updated_at: "2024-12-04",
            status: true,
        },
        {
            id: 3,
            title: "Top 10 des bâtons de trail pour gagner en efficacité",
            content: "Les bâtons de trail ne sont pas qu'un accessoire, ils deviennent rapidement indispensables dans les montées. Découvrez notre sélection des meilleurs bâtons pour gagner en efficacité et en endurance ...",
            created_at: "2024-12-05",
            updated_at: "2024-12-06",
            status: true,
        },
        {
            id: 4,
            title: "Plan d’alimentation pour réussir votre ultra-trail",
            content: "L’alimentation est un facteur clé pour performer lors d’un ultra-trail. Voici un plan détaillé pour répartir vos apports énergétiques avant, pendant et après la course ...",
            created_at: "2024-12-07",
            updated_at: "2024-12-08",
            status: true,
        },
        {
            id: 5,
            title: "Les meilleures chaussures pour les sentiers techniques",
            content: "Les terrains techniques exigent des chaussures fiables et robustes. Voici notre sélection des meilleures chaussures pour affronter les sentiers les plus difficiles avec confiance ...",
            created_at: "2024-12-09",
            updated_at: "2024-12-10",
            status: true,
        },
        {
            id: 6,
            title: "10 astuces pour optimiser votre récupération après un ultra",
            content: "La récupération après un ultra est cruciale pour éviter les blessures et repartir rapidement sur vos prochaines aventures. Voici 10 conseils pratiques pour optimiser cette phase essentielle ...",
            created_at: "2024-12-11",
            updated_at: "2024-12-12",
            status: true,
        },
        {
            id: 7,
            title: "Les gels énergétiques : comment bien les utiliser en course",
            content: "Les gels énergétiques sont souvent mal utilisés, ce qui peut causer des troubles digestifs. Découvrez comment les intégrer efficacement à votre stratégie nutritionnelle pour maximiser votre énergie ...",
            created_at: "2024-12-13",
            updated_at: "2024-12-14",
            status: true,
        },
        {
            id: 8,
            title: "Les 8 meilleures montres GPS pour le trail",
            content: "Une montre GPS est bien plus qu'un gadget pour les traileurs. Voici notre sélection des 8 meilleures montres pour suivre vos performances et ne jamais vous perdre sur les sentiers ...",
            created_at: "2024-12-15",
            updated_at: "2024-12-16",
            status: true,
        },
        {
            id: 9,
            title: "Les 5 stratégies pour éviter les crampes en trail",
            content: "Les crampes peuvent transformer une course en cauchemar. Découvrez 5 stratégies efficaces pour prévenir ce problème et rester performant tout au long de votre trail ...",
            created_at: "2024-12-17",
            updated_at: "2024-12-18",
            status: true,
        },
        {
            id: 10,
            title: "Comment choisir votre sac à dos de trail ?",
            content: "Un sac à dos adapté est indispensable pour transporter votre matériel. Voici nos conseils pour choisir le sac parfait en fonction de vos besoins et de vos courses ...",
            created_at: "2024-12-19",
            updated_at: "2024-12-20",
            status: true,
        },
    ];


    return (
        <div className="articles-container">
            <Navbar />
            <div className="articles-content">
                <h1>Nos Articles</h1>
                <div className="articles-grid">
                    {articles.map((article) => (
                        <div key={article.id} className="article-card">
                            <span className="article-tag">CONSEILS RUNNING</span>
                            <h2 className="article-title">{article.title}</h2>
                            <p className="article-excerpt">{article.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Articles;
