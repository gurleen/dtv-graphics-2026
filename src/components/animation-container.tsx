type AnimationContainerProps = {
    children: React.ReactNode;
    debug?: boolean;
};

export default function AnimationContainer({ children, debug }: AnimationContainerProps) {
    debug = debug ?? false;
    return (
        <>
            <div className="anim-container" style={{ position: 'absolute', width: 1920, height: 1080, backgroundColor: 'transparent' }}>
                {children}
            </div>
        </>
    );
}