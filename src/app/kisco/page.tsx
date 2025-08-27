import Speech from '@/components/Speech';

const Kisko = () => {
    return (
        <main>
            <Speech />
            <a
                style={{fontFamily: 'Inter'}}
                className="bg-gray-100 justify-center flex text-xl text-gray-800 py-6 text-center"
                href="/kisco/gmail">
                Gmail to CRM demo
            </a>
        </main>
    );
};

export default Kisko;
