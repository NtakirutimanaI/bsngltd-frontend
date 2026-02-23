import { useEffect, useState } from 'react';
import { fetchApi } from '@/app/api/client';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useLanguage } from '@/app/context/LanguageContext';

export function StatsDisplay() {
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        projectsCompleted: '0',
        happyClients: '0',
        teamMembers: '0',
        yearsExperience: '0'
    });

    useEffect(() => {
        fetchApi<any>('/dashboard/stats?role=public')
            .then(data => {
                if (data.publicStats) {
                    setStats({
                        projectsCompleted: data.publicStats.projectsCompleted + '+',
                        happyClients: data.publicStats.happyClients + '+',
                        teamMembers: data.publicStats.teamMembers + '+',
                        yearsExperience: data.publicStats.yearsExperience + '+'
                    });
                }
            })
            .catch(err => {
                console.error("Failed to fetch stats", err);
                // Fallback to static if API fails (graceful degradation)
                setStats({
                    projectsCompleted: '25+',
                    happyClients: '50+',
                    teamMembers: '15+',
                    yearsExperience: '10+'
                });
            });
    }, []);

    return (
        <>
            {[
                { label: t('projectsCompleted'), value: stats.projectsCompleted },
                { label: t('happyClients'), value: stats.happyClients },
                { label: t('teamMembers'), value: stats.teamMembers },
                { label: t('yearsExperience'), value: stats.yearsExperience },
            ].map((stat, index) => (
                <ScrollReveal key={index} className="text-center" delay={index * 0.1}>
                    <div className="text-4xl font-bold text-orange-600 mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                </ScrollReveal>
            ))}
        </>
    );
}
