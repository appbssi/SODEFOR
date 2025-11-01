'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck2,
  Users,
  FileText,
  Rocket,
  Car,
  Clock,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSidebar } from './ui/sidebar';
import { useState, useEffect } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Tableau de Bord', icon: Home },
  { href: '/personnel', label: 'Personnel', icon: Users },
  { href: '/attendance', label: 'Pointage', icon: CalendarCheck2 },
  { href: '/missions', label: 'T.P.P.H.T', icon: Rocket, tooltip: 'Temps du Personnel Permanent en Heure de Travail' },
  { href: '/vehicle-tracking', label: 'Suivi Véhicules', icon: Car },
  { href: '/reports', label: 'Rapport de Présence', icon: FileText },
  { href: '/hours-report', label: 'Bilan des Heures', icon: Clock },
];

function AppSidebarContent() {
    const pathname = usePathname();

    return (
        <div className="py-4 text-gray-400">
             <Link href="/dashboard" className="flex items-center ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">
                <span className="mr-2">
                    <span className="text-orange-500">s</span>SODEFPR
                </span>
                <Image
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAEYCAMAAADCuiwhAAABAlBMVEUAZv8z/2b///8AW/8AYP81/1cAZP80/2EAYv80/1wp2pwIcPk1/1kSjOYo1qAdrcsEaf0AV/8y/Wop2J4Ne/IAXv8cqs4Uj+Qt5ozc5P8X/1mx/7+8zf8AVv9a/36huf/m/+vi6f+Qrf/s//Cxxf+Hp/+p/7lShv9Ffv/k6/99of+i/7MAUf/J1v9plP/y//Rv/432+P9N/3YA/1La/+Bejf/N/9bV3//6+//t8f+et//5//p7/5aK/6F1m/9i/4S4/8UAS//Q/9iuwv+X/6vA/8uO/6Qpcf9Lgv/h/+UA/0V+09BuofYAcvGo2ObZ9upMpOQAQP+RwO+G5r9u47PF9tqAiNE8AAARmElEQVR4nO2de3uqSBKHERjAcWY3uMvuSjTGGBNjxGuMSdTcc0yy19nL9/8q213VXOXSRjD4PP7+OHOGg81LU91dVQ3dgrDXXnvttddee+2111577bXXXnvttddeG0naQQk/76AEdQclFHZQwk87KEHeQQnKDuq7e9y94qQZkhZ2nBhbXqXI5y/WJIRP77S6ZLiSc2h5irB8EUXrYIVauhPFSqXSuF+WQIKBCn0oW5UiP1ki6LzmpVG07p3ol1V/AU26xvdWurZs3dhQU4+JKAcTMVI3d+1vrG3SAG+9NE82tdy1opmJTrvfZSSafl4NwNx1NfLklW4nFhlspRfe4WQspWQ5liH2X/vw34t3Ys3ChXP04eGo2W8y+bHv07QRnU+1rgfgdVwsfrAqfDpwTKZQJG6jaWt8dkk1c5/LE+e1EiWUuVS4dKr5+VlViXuoDq7gf53jV2rAgQTXt1goq4es0m/m5YKvUNUcmIWoS8aI0582bbTm3DQZ0/jN+/jn5SC0++PRJTvpY2GfRO9n8Xw9e14UC5E/jPSnOaHZU/40PVcwRy7zUTHu5+rnlY39WQQTKhy7vx2MTXUt8LWgr4/8ZZePsD2KZ6Oki5YH2DJnzcejo+Nms+95SLPj/sODuQY2Z+TyCdDFFbPFB/84Tr6Q6qvcVT2ejc1iMdXIxehB9xDG8na1ci8RKg7iqOkD+2uvI6UXuchR0ATF5EOmpz542u5sJh4P5vNBf+YDl9KLXLRo6HWkmp/PDO5hTJoj7RTNsfdWREtKbQhKCZpoNBpcjkZH3parqqPFMRusxKqeMvTaHWqowro3Ut+LV6jw23ZqjixCz9OhjroXs0Avcp6aj4LQV/xt7ksq04tMUzNqhH7OGFp9ID3J8Gm3oAtjOlCepmUfW4JGb+EgsSlqXDK2A60+0Mt0jAQa4Y98+htAc/gYm0HDQN/4ewIMb6p3RK2teZh1SwToq88kh4m3OBXGq0QXNBXopKrhngkowng1y5Y6bejC+BCojzIdFdOGJr4OWEiWZs0LvcakEkayP8bZ1TWDHifNbv1hDf38j4xbI0L/8+cEjvVmbHWMOcrZQk+fkmZs15F0j4nG18zsGoaDaXpxgGDUWk4EmpWBqNSlbmipxQH6i5M07V9mZtVjWn4lJZda1jtDmznL0dyE5MhTGlWt6L2Kjfw8GGXZVZdphFtJIVBUhLoT4l9l2E1TqRBzpZDMlpxqvsyst3M0ooFAI96qeZJiOpufOF5kHQUQqUc0kdCNTYv9iUvA/Ha5BWbSgdDo9l9xNEKRQ7+Aq7RYJxu7gUyaE6YzJJHi8/IA+mE7zDiWf8RdjBOajq6ZetIeqXNaRXFn8EGbZ6SY661YdIF11XEn8EEXadTS3xa0+ZwQCawB3cw6geAIxpeYbCdfCgHiw9lgS0Zt/gDocXQKgW/6oka9pevtQGMkIN4b0dMXnNA3SS06PY1hzrGy3HjORapuDbqM07ubv2yhYNCyFWhMVLwYmzJrBxi0xE4lpyQTckI3G/umWumE+dLZ99TqK1xp4zkuzbADre1BJ1R0Yj5dct9Cec2+z4PAVvwtPq0u/DlBv56y11Bm19FvdKQmFZrhv3+NZxJ+iddPBbuaH7bhehzRWKtZ/ikeKtH3KCPy9VZ8PJxz2TzVC9CzR3MrLp4JM+SJ9cMFfVzekldq9rnGsCRo8F7etuVJw+SnmJimSIKGB7YtaHUB1pF4XiL01Rahob/rJ8cauYKGRs8R1SXNuYBzu62QFnuqpBkXVU36dus/tJxttUMYyP7L8e1W/OxG7Z6Ws6WItvhIrjXVkqd+Ejw8ubNFaGg/1c1nAfbQCVIf+jsIDemOFKCN1hahFylB18QdrOltQhfUjx2EHnP3HvHfOTxt0zzQpjm+0RD+Ei+ALq/3yv4XmVV4//5/CUBUCQ7TmEWIgzU/NfgCcxk/LLk2E/2lpE+wnU9FPgbzTOc91TL7tIHnXYEEaPBh7BwC77v/X5BatD/H4Gk/SUFAcTx/drAvs5rKV+3Pdz4+eU5PnnNRCw+XdjX0M3o7xbYNkW+GhGeiSHU+LxOzedPDfFyveM738tSCipWRxQwoTOFT8WZluV8mVEevWUEXCthsrnhP538DEusjE2hmHtwD77rQGb1ICNDcsyPrQj9mMu8yzramj7PpPmDqkPvt/XxA49sS3DmhnEAvdhC6oL7xj4e5gS6o6xh1XqCh05vtGLRKx5fZjplH8QxK5ws08gJdKEK0NeI6NzfQOLHF5yXkBpoVn1LkEig1M2iYrJ01eaYscwNdYGFi82zz2S1XWUMzV48ocRmKHEHDG4sQwSQN5zmCLpjFR1xi4McOQdtz4x9Jp+USOr1P+7YArcJHDJu/heApkQdatd+A91ulWva8HB/96zKu15I4KqYGXYRljF7PmPwvEo/6Z44Oy/TMMDAVg/LkUCAVaNU0R2ezPpHd1YqH3grF0c4WPe/tKAS8DOHtbAuDC828n12/eRfOSYBGvb1dL8a+TD0GiuJZcpJiQ2jVfP2xWCUKQl+GnULqfPFadusb80xvHNmPdaGbHmi1aM6jVvzxQaPb2TyaBZ8HqYTjkY2NwzhPSL4utPvw1OLD4VkEchAaHPxL0lAHtCl++M7sH87hG7Yi5D64Fj5ZAxrMgCUgVfNoHlyg6IroulAeRUGPCqxLJOd8XF15ntHxgLRKzPdyvMG0DjRc+Rk7fnPw7F9ZrrlYLOhyP6bdb61CP/sKI/3Nj7m7mNH19SdkPppcQeIa0LRqHqnFqeVX31po/cc32onYJ0ZAr2T51eLo7cop5ArsnW/AXWNZAYAuForFkdcom1dHR753OiEZEAYd0pWZ5YdDX+NMb84FWQYzqGnz0TNLJ15ejoNjRPGSH5pW93h+eeiUl3I0jn3ttbf59a/CvvZT14IGbvP1Gc2b8zN6fuhX0a/FIny5uBDocSw0/Y05mL/yL8TBD/3s6y0e51Gz5avQsFJRLDQs1UVaJedcAD+0j7kc/RVoCPRq3YfJLPPOQn0F+nURVyNfhi5wLwbJD22PJtfX8V+ObwDNK37oH8j8OE7o//MEDZ+sPs/HiZf+Su+xptZYs2bUfON542Ptfnp9rbPQDt8XGDmD5hNCL7zPZEeg/dEpQD+mN6uePnSRjvf+eSpzjakJHmWwYYe4q9BiCHR6LzBkBO135hE6Ma/IrYyg/TG1yZcM5Vb6+7n8AjXt/8AfesGPpLX7uCUcpC4K2POVK8AuAhU5rSukv5+LDNCy79A5QOtpXWLj18KDwk8fer6vkZUSXZW/Ukv9YmlJmq5CC9IpPdjJ7dYp4dDwhX9rD52mALoSWLk279A1ug5gcI1xhM6tTRsnYgi0ooBDkuKKg6kKP4zpBddfwMN57fOQTgr2//mGxvU4V3YlMmDBvfTWdkxXT+HQOE6muAdAmjJeIqDhE8EUPibLQsZpODR6HyluXJCmJKjp1urSPjoMlJPv3zlsVUobll05WYWW8guttcUo6Ereoe9Xx2tlGXE33y/0MRohgwhCD/PYEnXYN6wUZgQGbJC3+epbqUsRYMmm91BoGBPr+YNGFy/oTLN/g87wLn/DiwEm/RIOBusEcuxrsWUphhhjt/gYTvNmHwo6oBH7sWiYscmbfaB1RHnN2jkdLad586l1K9YAdHpPw/S2IEpFykEjYjhESVYOo1upER4f2tJK4AHmy6j1mwQo3Myyl6uq7g4T4kDs9HIVvhiw+pEoRENjzHWaI2gl0pV21a1EuibfI6WE0HEWq0NTTW8Ls42FDvNtN+4cNOrb/IwvGE8lZDZ0GqwPS7lxmmo89orh2F1enCYc7m6TKhFG+pO8GDUOHPUkHNiTbvPVg9MR5uqivFJXmGlKc2ucDYTW0UiGAftoLHPRFA1eD047px1IJw9WrcGU7JBnrJOgr56k3IHIsGJhsM7YIody4DR2EPMdbfhXY2X1Q813FB/KUlopWwsrW+LZEV7TW9WqZVmtriwrnqNtixytWp0uw5ZbVpXJOun+BvkOsFTjzvkHWyRYMbwHYRSybBi5NqlC2ZOaXbaviPOuLsc3Ae29Lg6tzrt1K3Za9kZBSq1HaseqPlmWOOzoOKEiWbgHlzi1/3IL6QGjzv7XFYlltIl1ETiKOWytdk8cEuvuzpqKjfsa3IliTCHHKjYsLLtjxDYWml8u6bImLTtO4KTRMKoy0Q1BosNwZYo3LtUwgV7S9fMJ8f+H7IkbT7gyeH3S6/UmdRaAad075ICjUxtaapOBtHquG4akTOiGSlCGImFv1KpJ+oQ2l0ZkDCegR9Mx8HcTBg2T8RV2rzWaJ2qgz4zuD13+XAOfosKCFh2XYG9JdCVx/aSC5WBajETjcPQcoaU6PfcJ65f2hkM2POEbANTP1aROwghAHQh7Mrh2CxdTljSKsnNw2jstASMmRb5g0HY/jcflCUJjOfqJH5o9jgmFln35XxygMHtpONCCDMFFRNqKIk3IjXdqCiuj5VzMGXiVA+oXNdAB1V1o7PMqcBz/DtCaRgf4FWiDlHOhKUqb1vOFPdIoJWpXlh6ARlcs2qvBe71YIqGMFQ1tzHGBDc/cmgea+R4Q/7nQWofEBN6bR2iJ/CFZAnvhxh3TJTgFZgu80Dr4j5H5EuZB3Atu5yiDM+lJhiNdLQiNk55V2Qctt8gfyhK7QgdaOaB/vJOGUfEYDDxGeFzSetBaGxt+5eWd7ZehvQ8D0J58nRea/ZQW7ULXYGDHd45caL1KORV7ztHN7rHZgloAuhsPzRotPCQcaFnde8I6hK4aAWgWBIAhM2hDWnq8ERv6qXbPimNH3DQag6bW622IgHAX3ecpkjsy3EsutOc2a67x+qDxId7qDnSn9nK7Cj2kw4UP2s05IDT0VAya9N9G7cJ5tBGSe35qBj35AnTgvRTD3UPPD70MQk+p6QC0dUIEU73xrphsVJ19EIkDuUFN10vTEOhK6e7WD30QhKatGaGH2MSG7dgdaej2P1LbqZN7mUFXgzZtRUDTmNW2aUmuhNi0bsgVH/RdwKY95tH6DWvitziHSWnTRkAcPQtr+9TQJpBVXOk9YADyQitLZ2LL6T2ULoP2d3lS1Qcd7D3ow3IaItvhJC7SkU86QCDr7wyaTcS70IqE0EIAGvN0gS5PR2iZWoALrbUZ9J3HwF3ooReanRML3bpnxmOcV7HiFAHu3hkRcU52ujIishQCLd0zIt7TLJncoh2kZ0TUGWet6odGC4Pe1Ony8Jy4QE5uOSkJjU42kCahHFD7GNqtRVE8npEXGq1Gcf0QCq0c0JuQKqd+aIX5Edr7jRcaZxJu3n3DuMKaZHS6jTQ7x3GlJ7sXc7w8ALrAiq95oJ9cq0FPEMYZOhhq3Wmgpp2eGULzade9urjqMClYcicy0Cc/m9q9C/0ZeDpQssVy5QZ1RTBEIc321oZWuvQpWtidMz+buaYyCb8plt81ZerS27YT1nQ4Hlo15+psRGR9QWRait6rdQDhFDWPG6gDRaPUJfiN1Lmghov3ZQcBkmEckO7mRhSYB40tvkWHM0MSqvgAQqHR05XgMRqSp9rxDR3mmmLsFZV2INCVqlhfSpoxqYovrAdW9PdTElKQkEPv0PGiy56ugYWd1uv0CvUl88OFLkJb9Reium01dl/hz/MqNRIxXJyQsmt06HthlsMmyhBa0cAMpxEWIp+0tHZjKFZ7vfrtie76pwcXF6LV692JlYY7ESTfVqgaROSwbhuq1mk4x+k/EUlQp6jg5JfRa9yKp73eKSm7ZxdiVLEMfHSKPKXlVazQZIny3ibVWWqREX9S856h6MsWPUoiTU/f481OeA6v7gMBRUSlMWS9TYs+ufeWbfj2i2C/jUjwgOur0K1ig2UrbAfZLJRl2Xvttddee+21116bK60PG7cpobSDSv/D4C0og0+ws9duQifsY5tLCb/uoJL3Zs6hEjZ1zKeE3+2gkjYqzaV2s8v7boCvaA+9Le0mdHEHJfx+ByUYO6jvjvb22itt/R/w0uDV6g0Q6QAAAABJRU5ErkJggg=="
                    alt="Logo Sodefor"
                    className="h-20 w-auto"
                    width={180}
                    height={72}
                />
             </Link>
            <ul className="mt-6 leading-10">
                {menuItems.map(item => (
                    <li key={item.href} className="relative px-2 py-1 ">
                        <Link 
                            href={item.href} 
                            className={cn(
                                "inline-flex items-center w-full text-sm font-semibold transition-colors duration-150",
                                pathname.startsWith(item.href) ? "text-white" : "text-gray-400 hover:text-gray-200"
                            )}>
                                <item.icon className="h-6 w-6" />
                                <span className="ml-4">{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function AppSidebar() {
  const { openMobile, setOpenMobile } = useSidebar();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <aside className="z-20 flex-shrink-0 hidden w-60 pl-2 overflow-y-auto bg-gray-800 md:block">
            {/* Render nothing on the server */}
        </aside>
    );
  }

  return (
    <>
      {openMobile && <div className="fixed inset-0 z-10 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center" onClick={() => setOpenMobile(false)}></div>}
      <aside
        className="fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-0 overflow-y-auto bg-gray-800 md:hidden"
        style={{ display: openMobile ? 'block' : 'none' }}
      >
        <AppSidebarContent />
      </aside>
      <aside className="z-20 flex-shrink-0 hidden w-60 pl-2 overflow-y-auto bg-gray-800 md:block">
        <AppSidebarContent />
      </aside>
    </>
  );
}
