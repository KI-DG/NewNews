import { useEffect, useState, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { MainPageContentCard } from "@/components/mainpage/MainPageContentCard";
import useMaincategoryNews from '@/hooks/main/useMaincategoryNews';
import useMainNewsAfter from '@/hooks/main/useMainNewsAfter';
import { LoginState } from '@/states/LoginState';
import { topicAtom, topicStateType } from '@/stores/NewsTopics';

import '@/styles/main/MainPageStyles.scss';

const SIZE = 10;
const SEC = 3;

interface newsMain {
    newsId : number,
    preNewsId : number,
    title : string,
    press : string,
    newsImage : string,
};

const categoryName: Record<string, number>= {
    "연관뉴스" : 1,
    "경제" : 1,
    "정치" : 2,
    "사회" : 3,
    "생활/문화" : 4,
    "IT/과학" : 5,
}

export function MainPageContent(){
    console.log('?')
    // 로그인 정보
    const isLogin = useRecoilValue(LoginState)[0];
    // 메인 뉴스 정보
    const [news, setNews] = useState<newsMain[] | undefined>();
    // topicState : {토픽설정에서 고른 토픽들, 지금 클릭한 토픽}
    const [topicState, setTopicState] = useRecoilState<topicStateType>(topicAtom);
    const [categoryId, setCategoryId] = useState(categoryName[topicState.focused])
    // 로그인, 연관뉴스 메세지
    const [alarm, setAlarm] = useState<null | string>(null);
    // 후속기사들
    const useNewsAfter = useMainNewsAfter();
    // 그외 토픽에 따른 기사들
    console.log("카테고리요청전")
    const maincategoryNews = useMaincategoryNews(categoryId, 0, 5);
    console.log("카테고리요청후")
    // 현재 보고있는 뉴스의 index
    let ioIndex: any;
    
    useEffect(()=>{
        setCategoryId(categoryName[topicState.focused])
        console.log(categoryName[topicState.focused])
        // intersectionObserver 옵션
        // root : viewport로 판단할 타겟
        // threshold: 관찰할 타겟이 얼마나 보일때 callback 할 지, 0~1
        const options = {
            root: document.querySelector('.main-page-content'),
            rootMargin: '0px',
            threshold: 1
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // entry의 target으로 DOM에 접근
                const $target = entry.target;
                const newsElems = document.querySelectorAll<HTMLElement>('.main-page-content-card');
                let news;
                // 화면에 노출 상태에 따라 해당 엘리먼트의 class를 컨트롤
                if (entry.isIntersecting) {
                    ioIndex = Number($target.id);
                    // console.log(ioIndex);
                    if (newsElems[ioIndex - 1]) {
                        // newsElems[ioIndex - 1].classList.add();
                    }
                    if (newsElems[ioIndex]) {
                        // newsElems[ioIndex].classList.add();
                    }
                    if (newsElems[ioIndex + 1]) {
                        // newsElems[ioIndex + 1].classList.add();
                    }
                } else {
                    // $target.classList.remove("screening");
                }
            });
        }, options);

        // 뉴스별 useQuery 다르게 요청
        if (topicState.focused === "연관뉴스") {
            if (isLogin.isLogin) {
                useNewsAfter.mutate({ userId: isLogin.id, page: 0, size: SIZE}, {
                    onSuccess: (data) => {
                        if (data.data.content.length > 0) {
                            console.log("data", data.data.content);
                            setNews(data.data.content);
                        } else {
                            setAlarm(`연관뉴스가 없습니다.\n ${SEC}초후 페이지를 이동합니다.`)
                            console.log("연관뉴스가 없습니다 3초후 페이지를 이동합니다.")
                            setTimeout(()=>{
                                setAlarm(null); 
                                setTopicState({topics: topicState.topics, focused: topicState.topics[1]}); 
                            }, SEC * 1000)
                        }
                    }
                });
            } else {
                setAlarm(`로그인시 이용가능합니다.\n ${SEC}초후 페이지를 이동합니다.`)
                console.log("로그인이 필요합니다")
                setTimeout(()=>{ 
                    setAlarm(null); 
                    setTopicState({topics: topicState.topics, focused: topicState.topics[1]}); 
                }, SEC * 1000)
            }
        } else { // 정치, 경제, 사회, ...
            console.log("maincategoryNews", maincategoryNews.data)
            // setNews(maincategoryNews.data.data.content)
        }
        const newsElems = document.querySelectorAll<HTMLElement>('.main-page-content-card');
        const mainpage = document.querySelector('.main-page-content');
        mainpage
        for (let i = 0; i < newsElems.length; i++) {
            newsElems[i].id = `page-${i}`;
            // 카드들 observer 등록
            io.observe(newsElems[i]);
        }
        if (mainpage) {
            mainpage.addEventListener('scroll', (e)=>{
                // console.log(ioIndex);
            })
        }
        
        // reorder()
    }, [topicState.focused])
    return (
        <div className="main-page-content">
            {news && news.map((news, index)=>{return <MainPageContentCard categoryId={categoryId} newsId={news.newsId} preNewsId={news.preNewsId} title={news.title} press={news.press} newsImage={news.newsImage} newsIndex={index} key={index}/>})}
            {alarm && <div className="main-page-alarm"><h3>{alarm}</h3></div>}
        </div>
    )
}